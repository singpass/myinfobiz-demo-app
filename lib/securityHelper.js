const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const nonce = require('nonce')();
const crypto = require('crypto');
const qs = require('querystring');
const jose = require('node-jose');
const URLSafeBase64 = require('urlsafe-base64');
const colors = require('colors');

var security = {};

// Sorts a JSON object based on the key value in alphabetical order
function sortJSON(json) {
  if (_.isNil(json)) {
    return json;
  }

  var newJSON = {};
  var keys = Object.keys(json);
  keys.sort();

  for (key in keys) {
    newJSON[keys[key]] = json[keys[key]];
  }

  return newJSON;
};

/**
 * @param url Full API URL
 * @param params JSON object of params sent, key/value pair.
 * @param method
 * @param appId ClientId
 * @param keyCertContent Private Key Certificate content
 * @param keyCertPassphrase Private Key Certificate Passphrase
 * @returns {string}
 */
function generateSHA256withRSAHeader(url, params, method, strContentType, appId, keyCertContent, keyCertPassphrase) {
  var nonceValue = nonce();
  var timestamp = (new Date).getTime();

  // A) Construct the Authorisation Token Parameters
  // var defaultApexHeaders = {
  //   "apex_app_id": appId, // App ID assigned to your application
  //   "apex_nonce": nonceValue, // secure random number
  //   "apex_signature_method": "SHA256withRSA",
  //   "apex_timestamp": timestamp, // Unix epoch time
  //   "apex_version": "1.0"
  // };

  var defaultApexHeaders = {
    "app_id": appId, // App ID assigned to your application
    "nonce": nonceValue, // secure random number
    "signature_method": "RS256",
    "timestamp": timestamp // Unix epoch time
  };
  // B) Forming the Base String
  // Base String is a representation of the entire request (ensures message integrity)

  // i) Normalize request parameters
  var baseParams = sortJSON(_.merge(defaultApexHeaders, params));

  var baseParamsStr = qs.stringify(baseParams);
  baseParamsStr = qs.unescape(baseParamsStr); // url safe

  // ii) construct request URL ---> url is passed in to this function
  // NOTE: need to include the ".e." in order for the security authorisation header to work
  //myinfosgstg.api.gov.sg -> myinfosgstg.e.api.gov.sg
  url = _.replace(url, ".api.gov.sg", ".e.api.gov.sg");

  // iii) concatenate request elements (HTTP method + url + base string parameters)
  var baseString = method.toUpperCase() + "&" + url + "&" + baseParamsStr;

  console.log("\x1b[32m", "Base String:", "\x1b[0m");
  console.log(baseString);

  // C) Signing Base String to get Digital Signature
  var signWith = {
    key: fs.readFileSync(keyCertContent, 'utf8')
  }; // Provides private key

  // Load pem file containing the x509 cert & private key & sign the base string with it to produce the Digital Signature
  var signature = crypto.createSign('RSA-SHA256')
    .update(baseString)
    .sign(signWith, 'base64');

  // D) Assembling the Authorization Header
  var strApexHeader = "PKI_SIGN timestamp=\"" + timestamp +
    "\",nonce=\"" + nonceValue +
    "\",app_id=\"" + appId +
    "\",signature_method=\"RS256\"" +
    ",signature=\"" + signature +
    "\"";

  //   "\",apex_timestamp=\"" + timestamp +
  //   "\",apex_nonce=\"" + nonceValue +
  //   "\",apex_app_id=\"" + appId +
  //   "\",apex_signature_method=\"SHA256withRSA\"" +
  //   ",apex_version=\"1.0\"" +
  //   ",apex_signature=\"" + signature +
  //   "\"";

  return strApexHeader;
};

/**
 * @param url API URL
 * @param params JSON object of params sent, key/value pair.
 * @param method
 * @param appId API ClientId
 * @param passphrase API Secret or certificate passphrase
 * @returns {string}
 */
security.generateAuthorizationHeader = function(url, params, method, strContentType, authType, appId, keyCertContent, passphrase) {

  if (authType == "L2") {
    return generateSHA256withRSAHeader(url, params, method, strContentType, appId, keyCertContent, passphrase);
  } else {
    return "";
  }

};


// Verify & Decode JWS or JWT
security.verifyJWS = async function (jws, publicCert) {
  try {
    let keyStore = await jose.JWK.asKey(fs.readFileSync(publicCert, 'utf8'), "pem");

    let result = await jose.JWS.createVerify(keyStore).verify(jws);
    let payload = JSON.parse(Buffer.from(result.payload).toString());

    let exp = payload.exp;
    let currentTimeStamp = Math.floor(Date.now() / 1000);

    if (currentTimeStamp > exp) {
      throw "JWS expired";
    }

    return payload;
  } catch (error) {
    console.error("Error with verifying and decoding JWS: %s".red, error);
    throw ("Error with verifying and decoding JWS");
  }
}

// Decrypt JWE using private key
security.decryptJWE = function decryptJWE(header, encryptedKey, iv, cipherText, tag, privateKey) {
  console.log("\x1b[32mDecrypting JWE \x1b[0m(Format: \x1b[31m%s\x1b[0m\x1b[1m%s\x1b[0m\x1b[36m%s\x1b[0m\x1b[1m%s\x1b[0m\x1b[32m%s\x1b[0m\x1b[1m%s\x1b[0m\x1b[35m%s\x1b[0m\x1b[1m%s\x1b[0m\x1b[33m%s\x1b[0m)","header",".","encryptedKey",".","iv",".","cipherText",".","tag");
  console.log("\x1b[31m%s\x1b[0m\x1b[1m%s\x1b[0m\x1b[36m%s\x1b[0m\x1b[1m%s\x1b[0m\x1b[32m%s\x1b[0m\x1b[1m%s\x1b[0m\x1b[35m%s\x1b[0m\x1b[1m%s\x1b[0m\x1b[33m%s\x1b[0m",header,".",encryptedKey,".",iv,".",cipherText,".",tag);
  try {
    var keystore = jose.JWK.createKeyStore();
    var plain = "";
    var data = {
      "type": "compact",
      "ciphertext": cipherText,
      "protected": header,
      "encrypted_key": encryptedKey,
      "tag": tag,
      "iv": iv,
      "header": JSON.parse(jose.util.base64url.decode(header).toString())
    };
    return new Promise(function(resolve, reject) {
      keystore.add(fs.readFileSync(privateKey, 'utf8'), "pem")
        .then(function(jweKey) {
          // {result} is a jose.JWK.Key
          console.log("jweKey: ", jweKey);
          jose.JWE.createDecrypt(jweKey)
            .decrypt(data)
            .then(function(result) {
              var data = result.payload.toString();
              plain = JSON.parse(data);

              resolve(plain);
            })
            .catch(function(error) {
              console.log("Decryption Failed..." + error);
              reject(error);
            });
        });
    });
  }
  catch(error) {
    console.error("\x1b[31mError with decrypting JWE:\x1b[0m %s", error);
    throw("Error with decrypting JWE");
  }
}

module.exports = security;

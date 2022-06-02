const https = require('https');
const qs = require('querystring');

/**
 * Get HTTPS Response
 * 
 * This method is a wrapper around https to make HTTPS calls
 * 
 * @param {string} domain - Domain of the url
 * @param {string} requestPath - Request path of the url
 * @param {JSON} headers  - Request headers
 * @param {string} method - Calling method e.g(GET)
 * @param {JSON} body - Body of the request if any
 * @returns {Promise} - Promise that resolve http response
 */
exports.getHttpsResponse = function (domain, requestPath, headers, method, body) {

    return new Promise((resolve, reject) => {
        var requestOptions = {
            method: method,
            protocol: "https:",
            hostname: domain,
            port: 443,
            path: requestPath,
            headers: headers
        };

        requestOptions.agent = new https.Agent(requestOptions);

        var request = new Promise((resolve, reject) => {
            let callRequest = https.request(requestOptions, (resp) => {
                let data = '';
                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    if (resp.statusCode == 200) {
                        resolve({
                            "statusCode": resp.statusCode,
                            "msg": data
                        });
                    } else {
                        reject({
                            "statusCode": resp.statusCode,
                            "msg": {
                                "error": data
                            }
                        });
                    }
                });

                resp.on('error', (e) => {
                    reject({
                        "statusCode": resp.statusCode,
                        "msg": {
                            "error": e
                        }
                    });
                });
            });
            var postData = qs.stringify(body);
            callRequest.write(postData);
            callRequest.end();
        });
        request
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
    });
};
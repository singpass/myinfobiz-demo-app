## MyInfoBiz Demo App Setup

### 1.1 Install Node and NPM

In order for the demo application to run, you will need to install Node and NPM.

Follow the instructions given by the links below depending on your OS.

- [Install Node and NPM for Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
- [Install Node and NPM for Linux](http://blog.teamtreehouse.com/install-node-js-npm-linux)
- [nstall Node and NPM for Mac](http://blog.teamtreehouse.com/install-node-js-npm-mac)


### 1.2 Run NPM install

Run the following command in the folder you unzipped the application:
```
npm install
```

### 1.3 Start the Application

**For Linux/MacOS**

Execute the following command to start the application:
```
  ./start.sh
```


**For Windows**

Execute the following command to start the application:
```
  .\start.bat
```


**Access the Application on Your Browser**
You should be able to access the sample application via the following URL:

```
http://localhost:3001
```

![Demo Screenshot](screenshot_main.png)
![Demo Screenshot](screenshot_form.png)

---
## Login with MockPass

Use this test ID and password to login to SingPass:

UEN/Entity ID: ``T15LP0011L``
CorpPass ID: ``CPAGT1``
Password: ``Spcp1111``

---
## Enable PKI Digital Signature

<span style="color:red">
<strong>Note:</strong> <br>
As of version 2.0.0 of our API specifications, the URLs of the APIs have changed.
Please note the different configurations accordingly.
</span>


### v2.0.0 APIs (LATEST)

**For Linux/MacOS**

Edit the ``start.sh``. Look for ``SANDBOX ENVIRONMENT``, Comment out these configurations,
```
# SANDBOX ENVIRONMENT (no PKI digital signature)
# export AUTH_LEVEL=L0
# export MYINFOBIZ_API_AUTHORISE='https://sandbox.api.myinfo.gov.sg/biz/v2/authorise'
# export MYINFOBIZ_API_TOKEN='https://sandbox.api.myinfo.gov.sg/biz/v2/token'
# export MYINFOBIZ_API_ENTITYPERSON='https://sandbox.api.myinfo.gov.sg/biz/v2/entity-person-sample'

```

Look for ``TEST ENVIRONMENT``, uncomment these configurations,
```
# TEST ENVIRONMENT (with PKI digital signature)
export MYINFOBIZ_API_AUTHORISE='https://test.api.myinfo.gov.sg/biz/v2/authorise'
export MYINFOBIZ_API_TOKEN='https://test.api.myinfo.gov.sg/biz/v2/token'
export MYINFOBIZ_API_ENTITYPERSON='https://test.api.myinfo.gov.sg/biz/v2/entity-person'
```
Execute the following command to start the application:
```
  ./start.sh
```

**For Windows**

Edit the ``start.bat``. Look for ``SANDBOX ENVIRONMENT``, comment out these configurations,
```
rem SANDBOX ENVIRONMENT (no PKI digital signature)
rem set AUTH_LEVEL=L0
rem set MYINFOBIZ_API_AUTHORISE=https://sandbox.api.myinfo.gov.sg/biz/v2/authorise
rem set MYINFOBIZ_API_TOKEN=https://sandbox.api.myinfo.gov.sg/biz/v2/token
rem set MYINFOBIZ_API_ENTITYPERSON=https://sandbox.api.myinfo.gov.sg/biz/v2/entity-person-sample
```
Look for ``TEST ENVIRONMENT``, uncomment these configurations,
```
rem TEST ENVIRONMENT (with PKI digital signature)
set AUTH_LEVEL=L2
set MYINFOBIZ_API_AUTHORISE=https://test.api.myinfo.gov.sg/biz/v2/authorise
set MYINFOBIZ_API_TOKEN=https://test.api.myinfo.gov.sg/biz/v2/token
set MYINFOBIZ_API_ENTITYPERSON=https://test.api.myinfo.gov.sg/biz/v2/entity-person
```
Execute the following command to start the application:
```
  .\start.bat
```

---

## Reporting issues

You may contact [support@myinfo.gov.sg](mailto:support@myinfo.gov.sg) for any other technical issues, and we will respond to you within 5 working days.

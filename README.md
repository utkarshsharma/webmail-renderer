# webmail-renderer

```
## Download the code
$ git clone https://github.com/utkarshsharma/webmail-renderer

## If you don't already have Selenium Standalone Server 2.45.0 downloaded in your computer, run the following command on your terminal. Otherwise, ignore it.
$ curl -O http://selenium-release.storage.googleapis.com/2.45/selenium-server-standalone-2.45.0.jar

$ cd webmail-renderer
$ npm install                         ##this will install webdriverio in your computer

## Create a config file
$ cp config.json.template config.json
$ vi config.json   (<== Put in gmail credentials ==>)

## Enter Sending Credentials (These credentials should be of a gmail account with reduced security. "Allow Less Secure Apps" should be ON
$ cp send_credentials.json.template
$ vi send_credentials.json   (<== Put in gmail credentials of the sender account ==>)

## Run the renderer
$ nodejs main.js
```

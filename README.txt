# webmail-renderer
## Download the code
$ git clone https://github.com/utkarshsharma/webmail-renderer

## If you don't already have Selenium Standalone Server 2.45.0 downloaded in your computer, run the following command on your terminal. Otherwise, ignore it.
$ curl -O http://selenium-release.storage.googleapis.com/2.45/selenium-server-standalone-2.45.0.jar

$ cd webmail-renderer
$ npm install                         ##this will install webdriverio in your computer
## Create a config file
$ cp config.json.template config.json
$ vi config.json   (<== Put in gmail credentials ==>)
## Run the renderer
$ nodejs main.js

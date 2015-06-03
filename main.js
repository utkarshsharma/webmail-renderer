var util = require('util'),
    exec = require('child_process').exec,
    child;

child = exec('java -jar selenium-server-standalone-2.45.0.jar')

var path = require ('path')
var webdriverio = require ('webdriverio')
var fs = require ('fs');

var homedir = process.env['HOME']

var content = fs.readFileSync('config.json');

var obj = JSON.parse(content);
var usr = obj.username
var pwd = obj.password

var filepath1 = homedir + '/gmailscreenshot'
var filepath2 = 'file://' + homedir + '/gmailscreenshot'

var location

var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};

webdriverio
	.remote(options)
    .init()
    .url ('https://gmail.com')
    .setValue ('input[type="email"]', usr)
	.click('#next')
	.windowHandleMaximize()
	.waitFor('input[type="password"]',5000)
    .setValue ('input[type="password"]', pwd)
    .click ('#signIn')
	.waitFor('input[aria-label="Search"]',20000)
	.click('#:3w')
	.waitFor('img[alt="In new window"]',10000)
	.saveScreenshot(filepath1)
	.element('<body>').keys(['Control','t'])
	.url(filepath2)

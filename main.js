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

var credentials = fs.readFileSync('send_credentials.json');
var sender = JSON.parse(credentials);
var usr_send = sender.username
var pwd_send = sender.password

usr_send = usr_send + '@gmail.com'

var data = fs.readFileSync('htmlEmail.json')
var Email = JSON.parse(data)
var subj = Email.subject
var htmlEmail = Email.htmlmessage
var textEmail = Email.textmessage


var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: usr_send,
        pass: pwd_send
    }
});
transporter.sendMail({
    from: usr_send,
    to: usr + '@gmail.com',
    subject: subj,
    text: textEmail,
    html: htmlEmail
});

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
	.setValue('input[id="gbqfq"]', usr_send)
	.click('#gbqfb')
	.waitFor('input[aria-label="Search"]',20000)
	.element('<body>').keys(['Down arrow','Enter'])
	.waitFor('img[alt="In new window"]',10000)
	.saveScreenshot(filepath1)
	.element('<body>').keys(['Control','t'])
	.url(filepath2)

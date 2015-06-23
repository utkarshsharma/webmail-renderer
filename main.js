var util = require('util'),
    exec = require('child_process').exec,
    child;

child = exec('java -jar selenium-server-standalone-2.45.0.jar')

var path = require ('path')
var webdriverio = require ('webdriverio')
var fs = require ('fs');

var homedir = process.env['HOME']
var nodemailer = require('nodemailer');

var loginDetails = fs.readFileSync('config.json');

var obj = JSON.parse(loginDetails);
var usr = obj.receivers.gmail.username
var pwd = obj.receivers.gmail.password
var usr_yahoo = obj.receivers.yahoo.username
var pwd_yahoo = obj.receivers.yahoo.password
//usr_yahoo = usr_yahoo + '@yahoo.com'

var usr_send = obj.sender.username
var pwd_send = obj.sender.password

usr_send = usr_send + '@gmail.com'

var filepath1 = homedir + '/gmailscreenshot'
//var filepath2 = 'file://' + filepath1
var filepath3 = homedir + '/yahooscreenshot'
//var filepath4 = 'file://' + filepath3

var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};
var client = webdriverio.remote(options);
var http = require ('http');
var url = obj.url;

var time= new Date().getTime();

function poll() {
	http.get(url, function(res) {
	    var body = '';
	    res.on('data', function(chunk) {
	        body += chunk;
	    });

	    res.on('end', function() {
	        var Email = JSON.parse(body)
	     	var newTask = Email.newTask;
	     	if (newTask==1){
	     		render();
	     	}
	     });
	});
}

poll();

function render() {
	var http = require ('http');
	http.get(url, function(res) {
	    var body = '';
	    res.on('data', function(chunk) {
	        body += chunk;
	    });

	    res.on('end', function() {
	        var Email = JSON.parse(body)

			var subj = Email.subject
			var htmlEmail = Email.htmlmessage
			var textEmail = Email.textmessage
			var gmail = Email.render_with.gmail;
			var yahoo = Email.render_with.yahoo;
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
			    bcc: usr_yahoo,
			    subject: subj,
			    text: textEmail,
			    html: htmlEmail
			});
			client
				.init()
				.windowHandleMaximize();

			if (gmail==1) {
				client		
					.url ('https://gmail.com')
					.waitFor('input[id="Email"]',5000)
				    .setValue('input[id="Email"]', usr)
					.click('#next')
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
					//.element('<body>').keys(['Control','t'])
					//.url(filepath2);
			}
			if (yahoo==1) {
				client
				    .url ('https://mail.yahoo.com')
				    .waitFor('input[name="username"]',5000)
				    .setValue('input[name="username"]', usr_yahoo)
				    .setValue ('input[name="passwd"]', pwd_yahoo)
				    .click ('#login-signin')
					.waitFor('input[placeholder="Search"]',10000)
					.setValue('input[placeholder="Search"]', usr_send)
					.element('<body>').keys('Enter')
					.pause(10000)
					.element('<body>').keys(['Down arrow'])
					.element('<body>').keys(['Enter'])
					.pause(5000)
					.saveScreenshot(filepath3)
					//.element('<body>').keys(['Control','t'])
					//.url(filepath4)
			}
			client.end(function() {
				setTimeout(poll(),60000);
			});
	    });
	});
};
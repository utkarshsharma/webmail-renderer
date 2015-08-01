var util = require('util'),
    exec = require('child_process').exec,
    child;

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var path = require ('path')
var webdriverio = require ('webdriverio')
var fs = require ('fs');
var fs1 = require ('fs');

var homedir = process.env['HOME']
var nodemailer = require('nodemailer');

var loginDetails = fs.readFileSync('config.json');

var obj = JSON.parse(loginDetails);
var usr_yahoo = obj.receivers.yahoo.username
var pwd_yahoo = obj.receivers.yahoo.password
var usr_send = obj.sender.username
var pwd_send = obj.sender.password

usr_send = usr_send + '@gmail.com'

var filepath_yahoo = homedir + '/yahooscreenshot.png'

var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};
var client = webdriverio.remote(options);
var http = require ('http');

var claimURL = 'http://0.0.0.0:3000/api/PreviewTasks/claim?renderer=yahoo'

var time= new Date().getTime();

//********************Main function here***************************************************

child = exec('cd '+ homedir + '&& java -jar selenium-server-standalone-2.45.0.jar');

setTimeout( function(){
	poll();
}, 20000)
//*****************************************************************************************

function poll() {
	http.get(claimURL, function(res) {
		var body = '';
	    res.on('data', function(chunk) {
	        body += chunk;
	    });

	    res.on('end', function() {
	        var Email = JSON.parse(body)
	     	var newTask = Email.newTask;
	     	if (newTask != null){
     			render(newTask);
				console.log('Task ' + newTask.id + ' picked');
	     	}
	     	else {
				console.log('No tasks pending');
		     	setTimeout( function(){
		     		poll();
		     	}, 60000)
	     	}
	     });
	});
}

function render(Task) {
			var subj = Task.message.subject
			var htmlEmail = Task.message.html
			var batchId = Task.batchId
			var textEmail = Task.message.text
			var transporter = nodemailer.createTransport({
			    service: 'gmail',
			    auth: {
			        user: usr_send,
			        pass: pwd_send
			    }
			});

			transporter.sendMail({
			    from: usr_send,
			    to: usr_yahoo + '@yahoo.com',
			    subject: subj,
			    text: textEmail,
			    html: htmlEmail
			});
			client
				.init()
				.windowHandleMaximize();

//***************************Yahoo Part********************************************************************
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
					client.saveScreenshot(filepath_yahoo)
//*********************************************************************************************************

			client.end(function() {
				// convert image to base64 encoded string
				setTimeout( function(){
		     		var base64data = base64_encode(filepath_yahoo);
					var postURL = 'http://0.0.0.0:3000/api/PreviewTasks/update?where=%7B%22batchId%22%3A%22'+batchId+'%22%2C%22renderer%22%3A%22yahoo%22%7D'
					var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
					xmlhttp.open("POST", postURL);
					xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
					xmlhttp.send(JSON.stringify(  {"result": base64data}));
					setTimeout(poll(), 10000);
		     	}, 5000)
			});
	    
	
};

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}
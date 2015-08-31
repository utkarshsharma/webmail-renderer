var util = require('util'),
  exec = require('child_process').exec,
  child;

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var path = require('path');
var webdriverio = require('webdriverio');
var fs = require('fs');
var fs1 = require('fs');

var homedir = process.env.HOME;
var nodemailer = require('nodemailer');

var loginDetails = fs.readFileSync('config.json');

var obj = JSON.parse(loginDetails);
var usr_yahoo = obj.receivers.yahoo.username;
var pwd_yahoo = obj.receivers.yahoo.password;
var usr_send = obj.sender.username;
var pwd_send = obj.sender.password;
var prevemURL = obj.prevemURL;
var prevemLoginEmail = obj.prevemCredentials.email;
var prevemLoginPass = obj.prevemCredentials.password;

usr_send = usr_send + '@gmail.com';

var filepath_yahoo = homedir + '/yahooscreenshot.png';
var batchId;
var error = null;

var options = {
  desiredCapabilities: {
    browserName: 'firefox'
  }
};
var client = webdriverio.remote(options);
var http = require('http');

var claimURL = prevemURL + '/api/PreviewTasks/claim?renderer=yahoo';

//********************Initial function call here*********************************************
var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
var loginURL = 'http://localhost:3000' + '/api/Users/login';
xmlhttp.open("POST", loginURL);
xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
  if (xmlhttp.readyState == 4) {
    accessToken = JSON.parse(xmlhttp.responseText).id;
    accessTokenUrlExtension = 'access_token=' + accessToken;
    poll();
  }
};
xmlhttp.send(JSON.stringify({"email": prevemLoginEmail, "password": prevemLoginPass, "ttl": 31556926}));
//*****************************************************************************************

function poll() {
  var xmlhttp1 = new XMLHttpRequest();   // new HttpRequest instance
  // Checking if Selenium is running
  var seleniumURL = 'http://localhost:4444/selenium-server/driver?cmd=getLogMessages';
  xmlhttp1.open("GET", seleniumURL);
  xmlhttp1.onreadystatechange = function() {
    if (this.readyState == this.DONE) {
      if (this.responseText != 'OK,') {
        //Selenium is not running. Starting selenium.
        console.log("Starting Selenium Server");
        child = exec('selenium-standalone start');
      }
    }
  };
  xmlhttp1.send();
  setTimeout(function() {
    http.get(claimURL + '&' + accessTokenUrlExtension, function(res) {
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        var Email = JSON.parse(body);
        var newTask = Email.newTask;
        if (newTask !== null) {
          render(newTask);
          console.log('Task ' + newTask.id + ' picked');
        }
        else {
          console.log('No tasks pending');
          setTimeout(function() {
            poll();
          }, 60000);
        }
      });
    });
  }, 5000);
}

function render(Task) {
  var subj = Task.message.subject;
  var htmlEmail = Task.message.html;
  batchId = Task.batchId;
  var textEmail = Task.message.text;
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

  client.on('error', function(e) {
    error = e;
    // will be executed everytime an error occured
    // e.g. when element couldn't be found
    if (e.err) {
      if (e.err.code == 'ECONNREFUSED') {
        client.end();
        post_back('Connection'); //Posting Connection to the result field of the task to tell that this is an "Connection Refused" kind of error.
      }
    }
    else if (e.body) {
      if (e.body.value.class === 'org.openqa.selenium.NoSuchElementException') {
        client.end();
        post_back('Element'); //Posting Element to the result field of the task to tell that this is an "Element Not Found" kind of error.
      }
    }
    else {
      client.end();
      post_back('Unknown');
    }
  });

  client
    .init()
    .windowHandleMaximize()

//***************************Yahoo Part********************************************************************
    .url('https://mail.yahoo.com')
    .waitFor('input[name="username"]', 5000)
    .setValue('input[name="username"]', usr_yahoo)
    .setValue('input[name="passwd"]', pwd_yahoo)
    .click('#login-signin')
    .waitFor('input[placeholder="Search"]', 10000)
    .setValue('input[placeholder="Search"]', usr_send)
    .element('<body>').keys('Enter')
    .pause(10000)
    .element('<body>').keys(['Down arrow'])
    .element('<body>').keys(['Enter'])
    .pause(5000)
    .saveScreenshot(filepath_yahoo);
//*********************************************************************************************************

  client.end(function() {
    setTimeout(function() {
      if (error === null) {
        // convert image to base64 encoded string
        var base64data = base64_encode(filepath_yahoo);
        post_back(base64data);
      }
    }, 5000);
  });
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}

function post_back(base64data) {
  var postURL = prevemURL + '/api/PreviewTasks/update?where=%7B%22batchId%22%3A%22' + batchId + '%22%2C%22renderer%22%3A%22yahoo%22%7D';
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  xmlhttp.open("POST", postURL + '&' + accessTokenUrlExtension);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
  //     if(xmlhttp.readyState == 4) {
  //         console.log(xmlhttp.responseText);
  //     }
  // }
  setTimeout(function() {
    xmlhttp.send(JSON.stringify({"result": base64data, "endTime": new Date().getTime() / 1000}));
  }, 5000);
  setTimeout(poll(), 10000);
}

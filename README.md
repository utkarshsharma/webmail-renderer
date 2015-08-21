# Webmail-Renderer

  Webmail renderer is a Node.js based code which polls the [*Preview Manager*](https://github.com/civicrm/prevem) periodically to claim a pending preview task of it's type, prepare a screenshot for that task and POST it back to the preview manager. Currently, there are two renderers, one for Gmail and YahooMail each. The renderer depends on the selenium standalone server for browser automation. So you need to install the selenium standalone server on your machine as well. These preview tasks are posted by the *Composer*, which is sitting on [CiviCRM](https://github.com/utkarshsharma/civicrm-core). The composer basically wants to know what an email it is composing would look like in different webmail clients. The webmail-renderer serves this purpose by creating the required screenshots and posting them back at the preview manager. The preview manager then relays those screenshots to the composer.

## Setup

```
## Download the code
$ git clone https://github.com/utkarshsharma/webmail-renderer

## If you don't already have Selenium Standalone Server installed on your machine, run the following 2 commands.
## You can skip them otherwise.
$ npm install selenium-standalone@latest -g
$ selenium-standalone install

$ cd webmail-renderer
$ npm install                         ##this will install webdriverio and nodemailer on your machine

## Create a config file
$ cp config.json.template config.json
$ vi config.json   (<== Put in gmail and yahoo credentials==>)
## The sender credentials should be of a gmail account with reduced security, i.e., "Allow Less Secure Apps" should be ON.
## You don't need to change the prevemURL and prevemCredentials fields.
## These entries match the default Prevem URL and the credentials that the renderers use to login to the Prevem.

## Run the renderers
$ nodejs gmail.js
$ nodejs yahoo.js ##In a new Terminal tab
##These nodejs scripts will keep running in the background and render any tasks pitched up to them.
```

## Email Preview Cluster

  The Prevem, the Composer and the Webmail Renderer have been/are being developed as a part of a project called Email Preview Cluster which is meant to help users (of CiviCRM) to generate previews (screenshots) of their emails to see what they'll look like to receivers on various email clients. A complete guide to install the Email Preview Service on your CiviCRM copy can be found on https://github.com/civicrm/prevem/blob/master/README.md
  The [midterm](https://civicrm.org/blogs/utkarshsharma/email-preview-cluster-midterm-blogpost) and [endterm](https://civicrm.org/blogs/utkarshsharma/email-preview-cluster-gsoc-completion-blog) blog posts regarding this GSoC project talk about it in more detail.
  The Webmail Renderer is completely Node.js based and it uses [WebdriverIO](http://webdriver.io) for browser automation and [Nodemailer](https://www.npmjs.com/package/nodemailer) for sending emails.

#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = __dirname +"/";
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile(__dirname+'/client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Drive API.
  authorize(JSON.parse(content), start_upload);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback();
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

// uploading files
function start_upload(){
    fs.readFile(__dirname+'/drive-nodejs-quickstart.json', function (err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      updateAccessToken(JSON.parse(content),upload)

    });
}
function updateAccessToken(content, callback){
    var OAuth2 = google.auth.OAuth2;
    var CLIENT_ID = "373736941463-e2duupbrepbg8m1dnndmvrlrkli32c6r.apps.googleusercontent.com";
    var CLIENT_SECRET = "fxBTcir2I088A2LMISjuVhwk";
    var REDIRECT_URL = "http://localhost";
    var token = "";
    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    oauth2Client.setCredentials({
        access_token: content.access_token,
        refresh_token: content.refresh_token
    });
    oauth2Client.refreshAccessToken(function(err, tokens){
        fs.writeFile(__dirname+'/drive-nodejs-quickstart.json', JSON.stringify(tokens));
        callback(tokens)
    });
}
function upload(content){
    var OAuth2 = google.auth.OAuth2;
    var CLIENT_ID = "373736941463-e2duupbrepbg8m1dnndmvrlrkli32c6r.apps.googleusercontent.com";
    var CLIENT_SECRET = "fxBTcir2I088A2LMISjuVhwk";
    var REDIRECT_URL = "http://localhost";
    var token = "";
    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    oauth2Client.setCredentials({
        access_token: content.access_token,
        refresh_token: content.refresh_token
    });
    var drive = google.drive({ version: 'v2', auth: oauth2Client });
    var dirPath = process.env.PWD;
    fs.readdir(dirPath, function(err,list){
        if(err) throw err;
        for(var i=0; i<list.length; i++)
        {
            if(path.extname(list[i])==='.jpg' || path.extname(list[i])==='.jpeg' || path.extname(list[i])==='.png' )
            {
                console.log(list[i]); //print the file
                drive.files.insert({
                auth: oauth2Client,
                resource: {
                    mimeType: 'image/'+path.extname(list[i]),
                    title: list[i]
                },
                media: {
                    mimeType: 'image/'+path.extname(list[i]),
                    body: fs.createReadStream(dirPath+'/'+list[i]) // read streams are awesome!
                  }
                },function(err,response){
                    if(err){
                        console.log('Error: ' + err);
                    }else{
                        console.log('create response: ' + response);
                    }
                });
            }

        }
    });
}

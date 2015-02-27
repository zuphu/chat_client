/*
Author: Anthony Guevara
Date:   Friday, 27 February 2015
Purpose: socket.io chat applicaion using express framework. Most of socket code lives in
         local module ./lib/chat_server.js.
*/
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var chatServer = require('./lib/chat_server'); /* Local module */

app.use(express.static(path.join(__dirname, 'public')));

/* Default route*/
app.get('/', function(req, res){
    res.sendFile('index.html');
});

/* web server listening locally on port 3000*/
server.listen(3000, function(){
    console.log('listening on 127.0.0.1:3000. Open your browser to this address.');
});

/* socket.io connections are handled here */
chatServer.listen(server);

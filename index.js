var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var obj = {}
obj.connectNumber = -1;

/*Default route*/
app.get('/', function(req, res){
    res.sendfile('index.html');
});

/*socket.io connections*/
io.on('connection', function(socket){
    obj.connectNumber++;
    var xx = obj.connectNumber;
    socket.on('new connection', function(xxx) {
	console.log("New connection by user user " + xxx);
	io.emit('new connection', xx);
    });
    console.log('a user connected');
    socket.on('chat message', function(msg){
	io.emit('chat message', msg);
	console.log('message: ' + msg);
    });
});

/*web server listening locally on port 3000*/
http.listen(3000, function(){
    console.log('listening on 127.0.0.1:3000');
});

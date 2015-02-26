var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};
var clients =  {};


module.exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);

    io.sockets.on('connection', function (socket) {
	/*
	  socket.on('new connection', function(xxx) {
	  console.log("New connection by user user " + 1);
	  io.emit('new connection', 1);
	  });

	  socket.on('chat message', function(msg){
	  io.emit('chat message', msg);
	  console.log('message: ' + msg);
	  });
	*/

	clients[socket.id] = socket;
	guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
	joinRoom(socket, 'Lobby');
	handleMessageBroadcasting(socket, nickNames);
	handleNameChangeAttempts(socket, nickNames, namesUsed);
	handleRoomJoining(socket);
	handleWhisper(socket);
	socket.on('rooms', function() {
	    socket.emit('rooms', io.sockets.manager.rooms);
	});
	handleClientDisconnection(socket, nickNames, namesUsed);
    });
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('name result', {
	success: true,
	name: name
    });
    namesUsed.push(name);
    return guestNumber + 1;
}

function joinRoom(socket, room) {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('join result', room);
    var joinMsg = nickNames[socket.id] + ' has joined ' + room + '.'
    socket.broadcast.to(room).emit('chat message', joinMsg);

    var usersInRoom = io.sockets.adapter.rooms[room];

    if (Object.keys(usersInRoom).length) {
	var usersInRoomSummary = 'Users currently in ' + room + ': ';
	for (var index in usersInRoom) {
	    var userName = nickNames[index];
            usersInRoomSummary += userName;
    	    usersInRoomSummary += ' ';
	}
	usersInRoomSummary += '.';
	socket.emit('chat message', usersInRoomSummary);
    }
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
    socket.on('change name', function(name) {
	if (namesUsed.indexOf(name) == -1) {
	    var previousName = nickNames[socket.id];
	    var previousNameIndex = namesUsed.indexOf(previousName);
	    namesUsed.push(name);
	    nickNames[socket.id] = name;
	    delete namesUsed[previousNameIndex];
	    socket.emit('new name', name);
	    var msg = previousName + ' is now known as ' + name + '.'
	    socket.broadcast.to(currentRoom[socket.id]).emit('chat message', msg);
	} else {
	    socket.emit('name result', {
		success: false,
		message: 'That name is already in use.'
	    });

	}
    });
}

function handleMessageBroadcasting(socket) {
    socket.on('chat message', function (message) {
	console.log(message.text);
	console.log(message.room);
	var msg = nickNames[socket.id] + ': ' + message.text;
	io.sockets.in(message.room).emit('chat message', msg); 
    });
}

function handleRoomJoining(socket) {
    socket.on('join room', function(newRoom) {
	socket.leave(currentRoom[socket.id]);
	joinRoom(socket, newRoom);
    });
}

function handleWhisper(socket) {
    socket.on('whisper', function(whisper) {
	var whisperee = whisper.whisperTo;
	var msg = whisper.text;
	var socketId;

	for(var key in nickNames) {
	    if(nickNames.hasOwnProperty(key)) {
		if(nickNames[key] === whisperee) {
		    socketId = key;
		}
	    }
	}
	var sock = clients[socketId];
	socket.to(socketId).emit('chat message', msg);
    });
}

function handleClientDisconnection(socket) {
    socket.on('disconnect', function() {
	console.log(" a user is disconnecting... ");
	var userName = nickNames[socket.id];
	var msg = userName + " has disconnected.";
	console.log(msg);
	socket.broadcast.emit('chat message', msg);
	var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
	delete namesUsed[nameIndex];
	delete nickNames[socket.id];
    });
}

var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

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


	guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
	joinRoom(socket, 'Lobby');
	handleMessageBroadcasting(socket, nickNames);
	handleNameChangeAttempts(socket, nickNames, namesUsed);
	handleRoomJoining(socket);
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
	console.log(nickNames);
	console.log(usersInRoom);
	for (var index in usersInRoom) {
	    console.log("raw index:\t" + index);
	    var userSocketId = usersInRoom[index].id;
	    console.log("socketID:\t" + userSocketId);
	    if (userSocketId != socket.id) {
		if (index > 0) {
		    usersInRoomSummary += ', ';
		}
		usersInRoomSummary += nickNames[userSocketId];
	    }
	}
	usersInRoomSummary += '.';
	console.log(" moo " + usersInRoomSummary);
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
	var msg = nickNames[socket.id] + ': ' + message.text;
	socket.broadcast.to(message.room).emit('message', msg); 
    });
}

function handleRoomJoining(socket) {
    socket.on('join room', function(newRoom) {
	socket.leave(currentRoom[socket.id]);
	joinRoom(socket, newRoom);
    });
}

function handleClientDisconnection(socket) {
    socket.on('disconnect', function() {
	var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
	delete namesUsed[nameIndex];
	delete nickNames[socket.id];
    });
}

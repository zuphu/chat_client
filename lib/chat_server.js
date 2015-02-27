/*
Author: Anthony Guevara
Date:   Friday, 27 February 2015
Purpose: Socket.io chat application, user can chat, change rooms, private message
         change nick name.
*/
var socketio = require('socket.io');
var io;
var guestNumber = 1;  /* Default Guest name number*/
var nickNames = {};   /* Keep track of all nick names */
var namesUsed = [];   /* Array of names used */
var currentRoom = {}; /* Room user is in */
var clients =  {};    /* Sockets of all users connected */

/* Set all socket.io listeners */
module.exports.listen = function(server) {
    io = socketio.listen(server);

    io.sockets.on('connection', function (socket) {
	/* Save socket for new user */
	clients[socket.id] = socket;
	/* Set default guest name on connection */
	setGuestName(socket, guestNumber++, nickNames, namesUsed);
	/* Join default room, Lobby */
	joinRoom(socket, 'Lobby');
	/* Handle generic messages socket */
	handleMessageBroadcasting(socket, nickNames);
	/* Switching names socket */
	socketNameChange(socket, nickNames, namesUsed);
	/* Switching rooms socket */
	handleRoomJoining(socket);
	/* Whispering socket  */
	handleWhisper(socket);
	/* Client disconnecting socket  */
	handleClientDisconnection(socket, nickNames, namesUsed);
    });
};

/* Set default guest name on connection */
function setGuestName(socket, guestNumber, nickNames, namesUsed) {
    /* Create a default name */
    var name = 'Guest' + guestNumber;
    /* Save guest name using socket id */
    nickNames[socket.id] = name; 
    var msg = "Your name is: " + name;
    /* Send message to let client know who they are */
    socket.emit('chat message', msg);
    console.log(name + " connected");
    namesUsed.push(name);
}

/* Join a room, by default the user connects to Lobby on first connect */
function joinRoom(socket, room) {
    /* Change socket channel */
    socket.join(room);
    /* Save room using socket id */
    currentRoom[socket.id] = room;
    /* Change room on client */
    var msg = "You are now in room " + room;
    socket.emit('change room', { room: room,
			         text: msg
			       }); 
    var msg = nickNames[socket.id] + ' has joined ' + room + '.'
    /* Alert users in room new user has joined */
    socket.broadcast.to(room).emit('chat message', msg);

    /* Get all users in a room */
    var usersInRoom = io.sockets.adapter.rooms[room];

    /* Display all users in current room */
    if (Object.keys(usersInRoom).length > 0) {
	var usrMsg = 'Users currently in ' + room + ': ';
	for (var index in usersInRoom) {
	    var userName = nickNames[index];
            usrMsg += userName + ' ';
	}
	usrMsg += '.';
	socket.emit('chat message', usrMsg);
    }
}

/* Change default name */
function socketNameChange(socket, nickNames, namesUsed) {
    socket.on('change name', function(name) {
	var validName = true;
	var msg = "";
	
	if (namesUsed.indexOf(name) > -1) { /* Name must be unique */
	    msg += "Name needs to be unique. ";
	    validName = false;
	}
	
	if (name.indexOf(' ') > -1) { /* Name can't have spaces */
    	    msg = "Name can't have spaces. ";
	    validName = false;
	}
	
	/* Name must be different from current connected user names */
	if (namesUsed.indexOf(name) == -1 && validName) {
	    var prevName = nickNames[socket.id];
	    var prevNameIndex = namesUsed.indexOf(prevName);
	    /* Add new name to stack */
	    namesUsed.push(name);
	    nickNames[socket.id] = name;
	    /* Remove old name */
	    delete namesUsed[prevNameIndex];

	    /* Alert connected users about name change */
	    var msgName = 'You are known as ' + name;
	    socket.emit('chat message', msgName);
	    var msg = prevName + ' is now known as ' + name + '.'
	    socket.broadcast.to(currentRoom[socket.id]).emit('chat message', msg);
	}
	
	if (!validName)
	    socket.emit('chat message', msg);
    });
}

/* Messages are broadcasted to specific rooms */
function handleMessageBroadcasting(socket) {
    socket.on('chat message', function (message) {
	var msg = nickNames[socket.id] + ': ' + message.text;
	io.sockets.in(message.room).emit('chat message', msg); 
    });
}

/* Change rooms */
function handleRoomJoining(socket) {
    socket.on('change room', function(newRoom) {
	socket.leave(currentRoom[socket.id]);
	joinRoom(socket, newRoom);
    });
}

/* Whisper system command */
function handleWhisper(socket) {
    socket.on('whisper', function(whisper) {
	var whisperer = nickNames[socket.id]; /* Nick of whisperer*/
	var whisperee = whisper.whisperTo; /* Nick of whisperee */
	var fromMsg = 'Whisper sent to ' + whisperee;
	var toMsg = whisperer + ": " + whisper.text;
	/* Verify whisperee exists by getting socket id */
	var socketId = lookupKeyByValInObj(nickNames, whisperee);
	var whispererSocket = clients[socket.id];
	var whispereeSocket = clients[socketId];

	if (whisperer === whisperee) /* whispered self*/
	    fromMsg = "You can't whisper yourslf!";
	else if (!socketId) /* whisperee does not exist */
	    fromMsg = "That user doesn't exist!";
	else /* send message to whisperee */
    	    whispereeSocket.emit('chat message', toMsg);

	/* alert original whisperer message was sent */
	whispererSocket.emit('chat message', fromMsg);
    });
}

/* Client disconnect cleanup and alert connected users */
function handleClientDisconnection(socket) {
    socket.on('disconnect', function() {
	var userName = nickNames[socket.id];
	var msg = userName + " has disconnected.";
	console.log(msg);
	
	socket.broadcast.emit('chat message', msg);
	var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
	delete namesUsed[nameIndex];
	delete nickNames[socket.id];
    });
}

/* Helper function to lookup key by value in an object */
function lookupKeyByValInObj (obj, val) {
    for(var key in nickNames)
	if(nickNames.hasOwnProperty(key))
	    if(nickNames[key] === val)
		return key;
}

/*
Author: Anthony Guevara
Date:   27 Feb 2015
socket.io listeners for client side messages
*/
var ChatClient = function (socket) {
    this.socket = socket;
}

/* Listen for messages */
ChatClient.prototype.listenMessage = function() {
    console.log("Listening for 'chat message'.");
    socket.on("chat message", function (msg) {
	$('#messages').append($('<li>').text(msg));
	$('#messages').scrollTop($('#messages').prop('scrollHeight'));
    });
}

/* Listen for changing room messages */
ChatClient.prototype.listenChangeRoom = function() {
    console.log("Listening for 'change room'.");
    socket.on("change room", function (msg) {
	$('#messages').append($('<li>').text(msg.text));
	$('#channelName').text(msg.room);
    });
}

/* Set all listeners */
ChatClient.prototype.listenAll = function () {
    console.log("~*Setting all socket listeners.*~");
    this.listenMessage();
    this.listenChangeRoom();
}

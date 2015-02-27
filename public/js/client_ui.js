var ChatClient = function (socket) {
    this.socket = socket;
}

ChatClient.prototype.listenMessage = function() {
    console.log("Listening for 'chat message'.");
    socket.on("chat message", function (msg) {
	$('#messages').append($('<li>').text(msg));
	$('#messages').scrollTop($('#messages').prop('scrollHeight'));
    });
}

ChatClient.prototype.listenChangeRoom = function() {
    console.log("Listening for 'change room'.");
    socket.on("change room", function (msg) {
	$('#messages').append($('<li>').text(msg.text));
	$('#channelName').text(msg.room);
    });
}

ChatClient.prototype.listenAll = function () {
    console.log("~*Setting all socket listeners.*~");
    this.listenMessage();
    this.listenChangeRoom();
}

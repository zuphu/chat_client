var ChatClient = function (socket) {
    this.socket = socket;
    socket.emit('new connection', 'User connected');
}

ChatClient.prototype.listenNewConnection = function() {
    console.log("Listening for 'new connection'.");
    socket.on('new connection', function(connectNum){
	$('#messages').append($('<li>').text("User"+connectNum+ " connected"));
    });
}

ChatClient.prototype.listenMessage = function() {
    console.log("Listening for 'chat message'.");
    socket.on("chat message", function (msg) {
	$('#messages').append($('<li>').text(msg));
    });
}

ChatClient.prototype.listenRoomChange = function() {
    console.log("Listening for 'join room'.");
    socket.on("join room", function (newRoom) {
	$('#messages').append($('<li>').text(newRoom));
    });
}

ChatClient.prototype.listenNameResult = function() {
    console.log("Listening for 'name result'.");
    socket.on("name result", function (nameResult) {
	if (nameResult.success) {
    	    var msg = "Your name is: " + nameResult.name;
	    $('#messages').append($('<li><b></b>').text(msg));
	}
	console.log(nameResult.message);
    });
}

ChatClient.prototype.listenLobbyChange = function() {
    console.log("Listening for 'name change'.");
    socket.on("join result", function (room) {
	$('#messages').append($('<li>').text('You are now in room ' + room));
	$('#channelName').text(room);
    });
}

ChatClient.prototype.listenNewName = function() {
    console.log("Listening for 'new name'.");
    socket.on("new name", function (name) {
	$('#messages').append($('<li>').text('You are known as ' + name));
    });
}

ChatClient.prototype.listenAll = function () {
    console.log("~*Setting all socket listeners.*~");
    this.listenNewConnection();
    this.listenMessage();
    this.listenRoomChange();
    this.listenNameResult();
    this.listenLobbyChange();
    this.listenNewName();
}

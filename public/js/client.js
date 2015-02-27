/*
Author: Anthony Guevara
Date:   27 Feb 2015
Client side socket.io code 
*/
var socket = io();

$(document).ready(function() {
    $('#m').focus();
    var cc = new ChatClient(socket); /* Initialize client socket listener object */
    cc.listenAll(); /* Set all listeners client side */
    
    /* Send button will submit page */
    $('form').submit(function() {
	var msg = $('#m').val(); /* Get value from text box */
	processInput(msg, cc); /* Check if regular message or command */
	$('#m').val(''); /* Clear text box */
	return false;
    });
});

/* process user input depending on system command or regular message */
var processInput = function (message, chatClient) {
    if (message[0] == "/") { /* System command messages start with '/' */
	var words = message.split(' ');
	message = words[0]
	    .substring(1, words[0].length)
	    .toLowerCase();
	var result = false;

	switch(message) {
	case 'join':
	    words.shift();
	    var room = words.join(' ');
            this.socket.emit('change room', room);
	    break;
	case 'nick':
	    words.shift();
	    var name = words.join(' ');
	    this.socket.emit('change name', name);
	    break;
	case 'whisper':
    	    var whisperee = words[1];
	    words.splice(0, 2); /* explain this shit.. */
	    var msg = words.toString().replace(/,/g , " ");
	    this.socket.emit('whisper', { whisperTo: whisperee,
					  text: msg });
	default:
	    result = 'Unrecognized command.';
	    break;
	};
    }
    else{ /* Regular chat message */
	var sendMsg = { room: $('#channelName').text(),
			text: message
		      };
	this.socket.emit('chat message', sendMsg);
    }
    
    return result;
}

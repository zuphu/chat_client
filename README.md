# BullionCapital
socket.io chat application using the express framework

Installation:
Clone the repository
```
git clone https://github.com/zuphu/BullionCapital.git chat-app
```
Change Directory:
```
cd chat-app
```
Install dependencies:
```
npm install
```
Run the application through CLI:
```
node app
```

Open a web browser and visit http://localhost:3000/ or 127.0.0.1:3000
New connections are connected to default channel 'Lobby' and assigned a Guest# where # starts at 1 and increments based on new connections. The following system commands are available:
```
/whisper [UserName] [Message follows after] - private message a user
/nick [NickName] - change nick name
/join [Room] - join a new channel
```

Users in the same channel are able to send and receive messages to each other. Users in different channels will not be able to send and receive messages unless they are in the same channel. Using the /whisper command you can send messages to any user from any channel. Users are alerted when a user is disconnected from the same channel and alerted when a new user connects to the channel they are currently in.

Future Updates:
- add chat room PERSISTENCE

import { createServer } from "http";
import { parse } from "url";
import { WebSocketServer } from "ws";
import { Socket } from 'net';

//connection to pump
let ip = '192.168.244.233';
let port = 5000;

let client = new Socket();
client.connect(port, ip, function() {
	console.log('Connected');
});

client.on('data', function(data) {
	let time = new Date();
	console.log(time.toLocaleTimeString() + " " + data);
  let msgData = data.toString().split(' ')[0];
  let message = { date: time, sensorData: msgData};
  const jsonMessage = JSON.stringify(message);
  sendMessage(jsonMessage);
});

client.on('error', function(e) {
	console.log('Error:\n' + e);
})

client.on('close', function() {
	console.log('Connection closed');
});

// Create the https server
const server = createServer();
// Create instance of the websocket server
const wss = new WebSocketServer({ noServer: true });

// Take note of client or users connected
const users = new Set();

/*For the first connection "/request" path
 We take note of the clients that initiated connection and saved it in our list
 */
wss.on("connection", function connection(socket) {
  console.log("wss:: User connected");
  const userRef = {
    socket: socket,
    connectionDate: Date.now(),
  };
  console.log("Adding to set");
  users.add(userRef);
});

/*
This is the part where we create the two paths.  
Initial connection is on HTTP but is upgraded to websockets
The two path "/request" and "/sendSensorData" is defined here
*/
server.on("upgrade", function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);
  console.log(`Path name ${pathname}`);

  if (pathname === "/request") {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
//Open the server port in 8080
server.listen(8080);

//function to send websocket messages to user
const sendMessage = (message) => {
  // console.log("Sending messages to users!");
  for (const user of users) {
    user.socket.send(message);
  }
};
import { createServer } from "http";
import { Server } from "socket.io";

let hn;  // Hostname
let p;  // Port
let io;
let httpServer;
let clients = [];

const startServer = (hostname = '127.0.0.1', port = 3000) => {
  hn = hostname;
  p = port;
  httpServer = createServer();
  io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);
    clients.push(socket);
    socket.on('rubbish', () => console.log('ribbush'));
    socket.on('disconnect', (reason) => clientDC(socket, reason));
  });

  httpServer.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

const clientDC = (client, reason) => {
  const index = clients.indexOf(client);
  clients.splice(index, 1);
  console.log(`Client "${client.id}" disconnected: ${reason}`);
}

startServer();

export default {}

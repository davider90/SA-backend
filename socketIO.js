import { createServer } from "http";
import { Server } from "socket.io";
import { readFile } from "fs";  // For testing

const hn;
const p;
const io;
const httpServer;

const startServer = (hostname = '127.0.0.1', port = 3000) => {
  hn = hostname;
  p = port;
  
  server = createServer((req, res) => {
    readFile('connTest.html', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(data);
      return res.end();
    })
  });
  
  io = new Server(httpServer);
  
  io.on('connection', (socket) => console.log('new connection'));
  
  httpServer.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

export default {}
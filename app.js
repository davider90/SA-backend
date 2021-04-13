import DB from "./db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { readFile } from "fs";  // For testing

// BELOW IS COPY-PASTE (work in progress)

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  readFile('connTest.html', (err, data) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(data);
    return res.end();
  })
});

const IO = new Server(server);

IO.on('connection', (socket) => console.log('new connection'));

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// ABOVE IS COPY-PASTE

// Testing of db below
// const test = () => {
//   Db.instantiate();  // Should fail
//   // DB.setUp();  // Only run once!
//   Db.updatePlayer("David", 2, () => {
//     Db.getPlayer("David", (result) => console.log(result));
//     Db.getTopTen((result) => {
//       console.log(result);
//       Db.dispose();
//     });
//   });
// }

// Db.instantiate(test);

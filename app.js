import Db from "./db.js";
import http from "http";

// BELOW IS COPY-PASTE (work in progress)

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// ABOVE IS COPY-PASTE

// Testing of db
const test = () => {
  Db.instantiate();  // Should fail
  // DB.setUp();  // Only run once!
  Db.updatePlayer("David", 2, () => {
    Db.getPlayer("David", (result) => console.log(result));
    Db.getTopTen((result) => {
      console.log(result);
      Db.dispose();
    });
  });
}

Db.instantiate(test);

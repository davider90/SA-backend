/*
This file contains the backend's entry point.

The backend makes use of JavaScript modules to split up
functionality across multiple JS files. There are some applied
"tricks" here that are related to the software architecture.

TO WRITE ABOUT:
Introduce concurrency 
Backend as a Service
Client–Server
*/

import db from "./db.js";
import server from "./socketIO.js";

db.instantiate();
server.instantiate();

// Testing of db below
// const test = () => {
//   db.instantiate();  // Should fail
//   // db.setUp();  // Only run once!
//   db.newUser("David", "test", () => {
//     db.getPlayer("David", (result) => console.log(result));
//     db.getTopTen((result) => {
//       console.log(result);
//       db.logIn("David", "test", (result) => {
//         console.log(result);
//         db.dispose();
//       })
//     });
//   });
// }

// db.instantiate(test);

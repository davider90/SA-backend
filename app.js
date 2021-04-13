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

// INSERT IMPLEMENTATION HERE

// Testing of db below
const test = () => {
  db.instantiate();  // Should fail
  // db.setUp();  // Only run once!
  db.updatePlayer("David", 2, () => {
    db.getPlayer("David", (result) => console.log(result));
    db.getTopTen((result) => {
      console.log(result);
      db.dispose();
    });
  });
}

db.instantiate(test);

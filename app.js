/*
This file contains the backend's entry point.

The backend makes use of JavaScript modules to split up
functionality across multiple JS files. There are some applied
"tricks" here that are related to the software architecture.

How specific patterns and tricks are used within each "class"
is written about in the comments of their respective files.

To introduce concurrency, JavaScript's async functions, promises
and frequent use of callbacks has been used to parallelize tasks.
Of course, this is not true multithreading, but rather a clever
use of the event loop.

As much of the logic behind online functionality as feasibly
possible, has been confined to the backend's own scripts to
better fit the BaaS model.

Since each game client connects to one backend for online
services, this is clearly a client-server model.

The file startup-script.txt contains a startup script that the
Linux VM will run if it is rebooted (e.g. in case of a power
failure). This makes the server more reliable.
*/

import db from "./db.js";
import server from "./socketIO.js";

// db.instantiate();
// server.instantiate('35.228.7.69', 3000);
// server.instantiate();

// Testing of db below
// const test = () => {
//   db.instantiate();  // Should fail
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

const setup = () => {
  db.newUser("Alf Inge", "AI", () => {
    db.newUser("Jonatan", "J", () => {
      db.newUser("Asgeir", "A", () => {
        db.newUser("Birger", "B", () => {
          db.updatePlayer("Alf Inge", 2, () => {
            db.updatePlayer("Jonatan", 4, () => {
              db.updatePlayer("Asgeir", 2, () => {
                db.updatePlayer("Birger", 10, () => {
                  db.updatePlayer("David", 7);
                });
              });
            });
          });
        });
      });
    });
  });
}

db.instantiate(setup);

# SA-backend
## General Information
This is the backend of the Party Snake Android game. It is created in the context of the group project of TDT4240 Software Architecture.

A Google Cloud VM is used to run the backend and make it available at http://35.228.7.69:3000/. Google Cloud ensures that in the event of a VM failure, the VM is rebooted or booted from a new but equivalent location. The file startup-script.txt contains a startup script that the VM will run if it is rebooted (e.g. because of a power failure). This is to makes the server more reliable.

The files in this repo are extensibly commented in an attempt to make the logic and the use of patterns clearer for anyone not familiar with the code. The backend's entry point is the app.js file, and I would recommend you to start by reading the comments there.

## Installation Instructions
To install the backend, follow the steps below.

- Ensure that you have Node.js installed.
- Make sure you have MongoDB Community, or an equivalent version, installed and running. (The backend's database script assumes it is reachable at the default URL, mongodb://localhost:27017/mydb, but this is configurable in the db.js file.)
- Clone the repo to the desired location.
- In the cloned repo's directory, run `npm install`.
- Finally, run `node app.js`.

The backend should now be installed and running. You can configure which IP and port the backend should listen to, in the app.js file.

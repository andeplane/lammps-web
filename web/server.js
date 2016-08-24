// Just a quick script that starts a web server in node.js
// You will need connect and serve-static.
// Install with: npm install connect; npm install serve-static;
// Start server with: node server.js
// and open in browser: http://127.0.0.1:8080

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080);
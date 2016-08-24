var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname, cacheControl=false)).listen(8080);
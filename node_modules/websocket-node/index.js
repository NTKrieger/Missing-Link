var config = require('./config.js'),
	server = require('./lib/server');

server.start(config.port);

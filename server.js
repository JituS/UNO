var http = require('http');
var controller = require('./lib/controller.js');
var Game = require('./lib/game.js');
controller = controller();
var server = http.createServer(controller).listen(process.env.PORT || 8000);

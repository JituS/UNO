
var http = require('http');
var controller = require('./lib/controller.js');
var Game = require('./lib/game.js');
controller = controller();
var onStart = function(){
	console.log('Game started in port 8000')
};
var server = http.createServer(controller).listen(process.env.PORT,onStart);

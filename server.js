console.log(process.env);
var http = require('http');
var controller = require('./lib/controller.js');
var Game = require('./lib/game.js');
controller = controller();
var server = http.createServer(controller).listen(process.env.OPENSHIFT_NODEJS_PORT || 8080,process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');

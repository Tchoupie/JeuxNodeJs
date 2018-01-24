
var http = require('http');
var playerJS = require('./js/player');

httpServer = http.createServer(function(req,res)
{
	res.end('ça marche !');
});

httpServer.listen(1337);

var io = require('socket.io').listen(httpServer);
var players = {};

io.sockets.on('connection', function(socket)
{
	console.log('Nouvel utilisateur connecté');
	socket.on('login',function(user)
	{
		me = user;
		me.id = user.mail.replace('@','-').replace('.','-');

		let height=50;
 		let x=60;
 		let y=50;
 		let color = 'red';
		var player = playerJS.new(me.id,x,y,height,color);
		players[me.id] = player;
		console.log(players);
		//socket.broadcast.emit(); pour tout les utilisateurs sauf celui qui ce connecte
		//socket.emit('logged');
		socket.emit('logged',me.id);
		io.sockets.emit('newusr',player);
	})

	socket.on('update',function(player)
	{
		socket.broadcast.emit('update',player);
	});
});
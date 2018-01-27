const express = require('express');
const app = express();

app.use(express.static('public'));

// var http = require('http');
var playerJS = require('./public/js/player');
var obstacleJS = require('./public/js/obstacle');
function randomIntFromRange(min, max)
{
 	return Math.floor(Math.random() * (max - min + 1) + min)
}

// httpServer = http.createServer(function(req,res)
// {
// 	res.end('ça marche !');
// });

// httpServer.listen(1337);

var server = app.listen(process.env.PORT  || 5000, () => console.log('All is ok'));
var io = require('socket.io').listen(server);

var players = {};
var obstacles = [];

	for(var i=0;i<4;i++)
	{

		let width=randomIntFromRange(100,500);
		let height=25;
		let x;
		let y;
		if(i%2==0)
		{
			y=randomIntFromRange(0+height,250);
			x=randomIntFromRange(0+width,500);
		}
		else
		{
			y=randomIntFromRange(250,450);
			x=randomIntFromRange(500,1000-width);
		}

		let color='blue';
		var obstacle = obstacleJS.new(x,y,width,height,color);
		obstacles[i]=obstacle;
		// socket.emit('newobs',obstacle);
	}

io.sockets.on('connection', function(socket)
{
	var me = false;

	for(var k in players)
	{
		socket.emit('newusr',players[k]);
	}

	for(k in obstacles)
	{
		socket.emit('newobs',obstacles[k]);
	}

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

	socket.on('reset',function()
	{
		obstacles = new Array();
		io.sockets.emit('reset');
		for(var i=0;i<4;i++)
		{

			let width=randomIntFromRange(100,500);
			let height=25;
			let x;
			let y;
			if(i%2==0)
			{
				y=randomIntFromRange(0+height,250);
				x=randomIntFromRange(0+width,500);
			}
			else
			{
				y=randomIntFromRange(250,450);
				x=randomIntFromRange(500,1000-width);
			}

			let color='blue';
			var obstacle = obstacleJS.new(x,y,width,height,color);
			obstacles[i]=obstacle;
			io.sockets.emit('newobs',obstacle);
		}
	});

	socket.on('disconnect', function()
	{
		if(!me)
		{
			return false;
		}
		delete players[me.id];
		io.sockets.emit('disusr',me.id);
	});
});
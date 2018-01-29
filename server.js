const express = require('express');
const app = express();

app.use(express.static('public'));

// var http = require('http');
var playerJS = require('./public/js/player');
var obstacleJS = require('./public/js/obstacle');
var goalBallJS = require('./public/js/goalBall');

function randomIntFromRange(min, max)
{
 	return Math.floor(Math.random() * (max - min + 1) + min)
}

function isCollided(x,y)
{
	for(k in obstacles)
	{
		if((x > obstacles[k].x && x < obstacles[k].x + obstacles[k].width) && (y > obstacles[k].y && y < obstacles[k].y + obstacles[k].height))
		{
			console.log("collision n1");
			return true;
		}
		if(Math.abs(obstacles[k].y - y) < 50)
		{
			console.log("collision n2");
			return true;
		}
	}
	return false;
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
			y=randomIntFromRange(100+height,250);
			x=randomIntFromRange(0+width,500);
		}
		else
		{
			y=randomIntFromRange(250,450);
			x=randomIntFromRange(500,1000-width);
		}

		if(i!=0)
		{
			for(j = 0;j<obstacles.length;j++)
			{
				if(isCollided(x,y))
				{
					if(i%2==0)
					{
						y=randomIntFromRange(100+height,250);
						x=randomIntFromRange(0+width,500);
					}
					else
					{	
						y=randomIntFromRange(250,450);
						x=randomIntFromRange(500,1000-width);
					}
					j=-1;
				}
			}
		}
		let color='blue';
		var obstacle = obstacleJS.new(x,y,width,height,color);
		obstacles[i]=obstacle;
		// socket.emit('newobs',obstacle);
	}

	let x = randomIntFromRange(20,950);
	let y = 35;
	let radius = 20;
	let color = 'green';
	var goalBall = goalBallJS.new(x,y,radius,color);
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

	socket.on('goal', function(idPlayer)
	{
		//On reset les obsacles
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
				y=randomIntFromRange(100+height,250);
				x=randomIntFromRange(0+width,500);
			}
			else
			{
				y=randomIntFromRange(250,450);
				x=randomIntFromRange(500,1000-width);
			}

			if(i!=0)
			{
				for(j = 0;j<obstacles.length;j++)
				{
					if(isCollided(x,y))
					{
						if(i%2==0)
						{
							y=randomIntFromRange(100+height,250);
							x=randomIntFromRange(0+width,500);
						}
						else
						{	
							y=randomIntFromRange(250,450);
							x=randomIntFromRange(500,1000-width);
						}
					 	j=-1;
					}
				}
			}

			let color='blue';
			var obstacle = obstacleJS.new(x,y,width,height,color);
			obstacles[i]=obstacle;
			io.sockets.emit('newobs',obstacle);


			//On reset la goalBall
			x = randomIntFromRange(0,950);
			y = 35;
			let radius = 20;
			color = 'green';
			var goalBall = goalBallJS.new(x,y,radius,color);
			io.sockets.emit('newgoal',goalBall);
			//On reset les positions des joueurs
			io.sockets.emit('resetPos');
			for(k in players)
			{
				players[k].x = 60;
				players[k].y = 10;
			}
			io.sockets.emit('goal',idPlayer);
		}
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
				y=randomIntFromRange(100+height,250);
				x=randomIntFromRange(0+width,500);
			}
			else
			{
				y=randomIntFromRange(250,450);
				x=randomIntFromRange(500,1000-width);
			}

			if(i!=0)
			{
				for(j = 0;j<obstacles.length;j++)
				{
					if(isCollided(x,y))
					{
						if(i%2==0)
						{
							y=randomIntFromRange(100+height,250);
							x=randomIntFromRange(0+width,500);
						}
						else
						{	
							y=randomIntFromRange(250,450);
							x=randomIntFromRange(500,1000-width);
						}
					 	j=-1;
					}
				}
			}

			let color='blue';
			var obstacle = obstacleJS.new(x,y,width,height,color);
			obstacles[i]=obstacle;
			io.sockets.emit('newobs',obstacle);

			//On reset la goalball
			x = randomIntFromRange(20,950);
			y = 35;
			let radius = 20;
			color = 'green';
			var goalBall = goalBallJS.new(x,y,radius,color);
			io.sockets.emit('newgoal',goalBall);
		}
	});
	socket.on('disconnect', function()
	{
		if(!me)
		{
			return false;
		}
		delete players[me.id];
		socket.broadcast.emit('disusr',me.id);
	});
});
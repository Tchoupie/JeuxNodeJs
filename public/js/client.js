(function($)
{
	var socket = io({transports: ['websocket'], upgrade: false});
	var players = [];
	var obstacles = [];
	var idPlayer = '';
	var goalBall;	

	if(idPlayer == "Tchoupie")
 	{
 		$('#resetform').show();
 	}
 	else
 	{
 		$('#resetform').hide();
 	}

	$('#loginform').submit(function(e)
	{
		e.preventDefault();
		socket.emit('login',
		{
			username : $('#username').val(),
			mail : $('#mail').val(),
		});
	});

	$('#resetform').submit(function(e)
	{
		e.preventDefault();
		socket.emit('reset');
	});

	socket.on('update', function(uPlayer)
	{
		players.forEach(player =>
		{
			if(uPlayer.id == player.id)
			{
				player.x = uPlayer.x;
				player.y = uPlayer.y;
				player.score = uPlayer.score;
				player.isLeft = uPlayer.isLeft;
				player.velocity.x = uPlayer.velocity.x;
			}
		});
	});

	socket.on('logged',function(id)
	{
		idPlayer = id;
 		console.log('vous êtes connecté en tant que '+idPlayer);
 		$('#loginform').fadeOut();
 		if(idPlayer == "Tchoupie")
 		{
 			$('#resetform').show();
 		}
	});

	socket.on('resetPos',function()
	{
		players.forEach(player => 
		{
			player.x = 60;
			player.y = 300;
		});
	});

	socket.on('goal',function(idPlayer)
	{
		$('#scores').empty();
		players.forEach(player => 
		{
			if(player.id == idPlayer)
			{
				player.score++;
				player.isGoal = false;
			}
			$('#scores').append('<p>'+ player.id + ' : '+ player.score +' point(s)</p>');
		});
	});

	socket.on('newgoal',function(OgoalBall)
	{
		OgoalBall.sprites = new Image();
		OgoalBall.sprites.onload = function()
		{
			var s= 30/12;
 			ctx.drawImage(OgoalBall.sprites, 0,OgoalBall.srcY, 64,64, OgoalBall.x-12*s,OgoalBall.y-12*s, 64*s,64*s );
		}

		OgoalBall.sprites.src = "js/diamant.png";

		OgoalBall.update = function()
		{
			OgoalBall.draw();
		}

		OgoalBall.draw = function()
		{
			var s= 20/12;
			/*ctx.beginPath();
	 		ctx.arc(OgoalBall.x, OgoalBall.y, OgoalBall.radius, 0, Math.PI * 2, false);
	 		ctx.fillStyle = OgoalBall.color;
 			ctx.fill();
 			ctx.closePath();*/
 			ctx.drawImage(OgoalBall.sprites, 0, 0, 64,64, OgoalBall.x-12*s,OgoalBall.y-12*s, 64*s,64*s );
		}
		goalBall = OgoalBall;
	});

	socket.on('newobs',function(obstacle)
	{
		obstacle.sprites = new Image();
		obstacle.sprites.onload = function()
		{
			var s= 30/12;
 			ctx.drawImage(obstacle.sprites, 0,obstacle.srcY, 32,32, obstacle.x-12*s,obstacle.y-12*s, 32*s,32*s );
		}
		obstacle.sprites.src = "js/spritePlat.png";
		
		obstacle.update = function()
		{
			obstacle.draw();
		}

		obstacle.draw = function()
		{
			var s= 30/12;
			var nbBlock = Math.floor(obstacle.width/32);
			for(var i = 0;i<nbBlock;i++)
			{
				if(i%1==0)
				{
					obstacle.step=0;
				}
				if(i%2==0)
				{
					obstacle.step=2;
				}
				if(i%3==0)
				{
					obstacle.step=1;
				}
 				ctx.drawImage(obstacle.sprites, obstacle.step*32,obstacle.srcY, 32,32, (obstacle.x+(i*32))-8*s,obstacle.y-11*s, 32*s,32*s );
 			}
		}

		obstacles.push(obstacle);
	});

	socket.on('reset',function ()
	{
		obstacles = new Array();
		var goalBall;
	});

	socket.on('disusr',function(id)
	{
		var idPlayerToDelete;
		var i = 0;
		players.forEach(player =>
		{
			if(id == player.id)
			{
				console.log('suppression de'+ player.id);
				idPlayerToDelete = i;
			}
			i++;
		});
		players.splice(idPlayerToDelete,1);
	});

	socket.on('newusr',function(player)
	{	
		player.sprites = new Image();
		player.sprites.onload = function()
 		{
 			var s= 30/12;
 			ctx.drawImage(player.sprites, 0,player.srcY, 64,64, player.x-12*s,player.y-12*s, 64*s,64*s );
 		}
 		player.sprites.src = "js/garcon2Sheet.png";
		player.update =  function()
		{
			//On vérifie l'état avant de faire quoi que ce soit
 			if(player.y+player.height==canvas.height)
 			{
 				player.isOnAir=false;
 			}
 			else
 			{
 				player.isOnAir=true;
 			}

 			//Collision avec les obstacles
 			for(let i=0; i < obstacles.length;i++)
			{
				if((obstacles[i].x <= player.x+player.width  &&  player.x <= obstacles[i].x+obstacles[i].width) && (player.y+player.height>=(obstacles[i].y) && obstacles[i].y+(obstacles[i].height) >= player.y+player.height))
				{
					player.velocity.y = 0;
					player.y = obstacles[i].y-player.height;
					player.isOnAir=false;
				}

				if((obstacles[i].x <= player.x+player.width  &&  player.x <= obstacles[i].x+obstacles[i].width) && (player.y<=obstacles[i].y+(obstacles[i].height) && obstacles[i].y <= player.y))
				{
					player.velocity.y = 0;
					player.y = obstacles[i].y+obstacles[i].height;
				}
			}

			//Collision avec la goalBall
			if((player.x+(player.width/2) > goalBall.x-goalBall.radius && player.x+(player.width/2) < goalBall.x+goalBall.radius) && (player.y+(player.height/2) > goalBall.y-goalBall.radius && player.y+(player.height/2) < goalBall.y+goalBall.radius))
			{	
				if(!player.isGoal)
				{
					console.log('goal !' + player.score);
					player.isGoal = true;
					socket.emit('goal',player.id);
				}
			}

 			if(player.y+player.height>=canvas.height)
 			{
 				player.velocity.y = 0;
 				player.y = canvas.height-player.height;
 			}
 			else
 			{
 				if(player.isOnAir)
 				{
 					player.velocity.y += 1;
 				}
 			}

 			if(idPlayer == player.id)
 			{
	 			if(keyPress=='none' && !player.isOnAir)//Si aucune touche n'est pressé et que le joueur n'est pas en l'air
	 			{
	 				player.velocity.x = 0;
	 				socket.emit('update',player);
	 			}
	 			else
	 			{
	 				if(keyPress=='d' && player.velocity.x<10)
	 				{
	 					player.velocity.x = 6;
	 					player.isLeft = false;
	 				}
	 				if(keyPress=='q' && player.velocity.x>-10)
	 				{
	 					player.velocity.x = -6;
	 					player.isLeft = true;
	 				}
	 				if(keyPress==' ' && player.velocity.y==0 && !player.isOnAir)
	 				{		
	 					player.velocity.y -= 20;
	 				}
	 				socket.emit('update',player);
	 			}
	 		}
 			if(player.x+player.width > canvas.width || player.x <= 0)
 			{
 				if(player.x <= 0)
 				{
 					player.x=1;
 				}
 				if(player.x+player.width > canvas.width)
 				{
 					player.x=canvas.width-player.width;
 				}
 				player.velocity.x = 0;
 			}
 			player.y += player.velocity.y;
 			player.x += player.velocity.x;

 			if(player.velocity.x == 0 && !player.isLeft)
 			{
 				player.srcY=0;
 				player.step=0;
 			}

 			if(player.velocity.x == 0 && player.isLeft)
 			{
 				player.srcY=64;
 				player.step=10;
 			}

 			if(!player.isLeft && player.velocity.x > 0)
 			{
 				player.srcY = 0;
 				player.step+=0.25;
 				if(player.step>=11)
 				{
 					player.step-=11;
 				}
 			}

 			if(player.isLeft && player.velocity.x < 0)
 			{
 				player.srcY = 64;
 				player.step+=0.25;
 				if(player.step>=11)
 				{
 					player.step-=11;
 				}
 			}

 			player.draw();
 		}

 		player.draw = function()
 		{
 			var s= 30/12;
 			ctx.drawImage(player.sprites, 64*Math.floor(player.step), player.srcY, 64,64, player.x-12*s,player.y-12*s, 64*s,64*s );
 			ctx.font = "20px Arial";
			ctx.fillText(player.id,player.x,player.y-10); 
 		}

		players.push(player);

		$('#scores').append('<p>'+ player.id + ' : '+ player.score +' point(s)</p>');
	});


	var bg = new Image();
	function init()
	{
		console.log('Initialisation...');
		bg.onload = function()
 		{
 			var s= 30/12;
 			ctx.drawImage(bg, 0, 0, 1024, 640, 0,0, 1024*s,1024*s );
 		}
 		bg.src = "js/backgroundJeuxNode.png";
	}

	function animate()
 	{
 		requestAnimationFrame(animate);
 		ctx.clearRect(0,0,canvas.width,canvas.height);
 		var s= 100/12;
 		ctx.drawImage(bg, 0, 573, 1024, 640, 0,0, 1024*s,640*s );
 		if(obstacles)
 		if(obstacles)
	 	{
	 		obstacles.forEach(obstacle =>
	 		{
	 			obstacle.update();
	 		});
	 	}
 		if(players)
 		{
	 		players.forEach(player => 
	 		{
	 			player.update();
	 		});
	 	}
	 	if(goalBall)
	 	{
	 		goalBall.update();
	 	}
 	}
 	init();
	animate();
})(jQuery);
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
			player.y = 10;
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
				$('#scores').append('<p>'+ player.id + ' : '+ player.score +' point(s)</p>');
				player.isGoal = false;
			}
		});
	});

	socket.on('newgoal',function(OgoalBall)
	{
		OgoalBall.update = function()
		{
			OgoalBall.draw();
		}

		OgoalBall.draw = function()
		{
			ctx.beginPath();
	 		ctx.arc(OgoalBall.x, OgoalBall.y, OgoalBall.radius, 0, Math.PI * 2, false);
	 		ctx.fillStyle = OgoalBall.color;
 			ctx.fill();
 			ctx.closePath();
		}
		goalBall = OgoalBall;
	});

	socket.on('newobs',function(obstacle)
	{
		obstacle.update = function()
		{
			obstacle.draw();
		}

		obstacle.draw = function()
		{
			ctx.fillStyle = obstacle.color;
			ctx.fillRect(obstacle.x,obstacle.y,obstacle.width,obstacle.height);
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
	 					player.velocity.x += 1;
	 				}
	 				if(keyPress=='q' && player.velocity.x>-10)
	 				{
	 					player.velocity.x -= 1;
	 				}
	 				if(keyPress==' ' && player.velocity.y==0 && !player.isOnAir)
	 				{		
	 					player.velocity.y -= 20;
	 				}
	 				socket.emit('update',player);
	 			}
	 		}
 			if(player.x+player.width > canvas.width || player.x-player.width < 0)
 			{
 				if(player.x-player.width < 0)
 				{
 					player.x=player.width;
 				}
 				if(player.x+player.width > canvas.width)
 				{
 					player.x=canvas.width-player.width;
 				}
 				player.velocity.x = 0;
 			}
 			player.y += player.velocity.y;
 			player.x += player.velocity.x;
 			player.draw();
 		}

 		player.draw = function()
 		{
 			ctx.fillStyle = player.color;
 			ctx.fillRect(player.x,player.y,player.width,player.height);
 			ctx.font = "20px Arial";
			ctx.fillText(player.id,player.x,player.y-10); 
 		}

		players.push(player);

		$('#scores').append('<p>'+ player.id + ' : '+ player.score +' point(s)</p>');
	});

	function init()
	{
		console.log('Initialisation...');
	}

	function animate()
 	{
 		requestAnimationFrame(animate);
 		ctx.clearRect(0,0,canvas.width,canvas.height);
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
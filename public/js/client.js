(function($)
{
	var socket = io({transports: ['websocket'], upgrade: false});
	var players = [];
	var obstacles = [];
	var idPlayer = '';
	
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

 			for(let i=0; i < obstacles.length;i++)
			{
				if((obstacles[i].x <= player.x+player.width  &&  player.x <= obstacles[i].x+obstacles[i].width) && (player.y+player.height>=(obstacles[i].y) && obstacles[i].y+(obstacles[i].height) >= player.y+player.height))
				{
					console.log(player.id+" est rentré en collision par dessus");
					player.velocity.y = 0;
					player.y = obstacles[i].y-player.height;
					player.isOnAir=false;
				}

				if((obstacles[i].x <= player.x+player.width  &&  player.x <= obstacles[i].x+obstacles[i].width) && (player.y<=obstacles[i].y+(obstacles[i].height) && obstacles[i].y <= player.y))
				{
					player.velocity.y = 0;
					console.log(player.id+" est rentré en collision par en dessous");
					player.y = obstacles[i].y+obstacles[i].height;
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
	 				if(keyPress=='d')
	 				{
	 					player.velocity.x += 1;
	 				}
	 				if(keyPress=='q')
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
 	}
 	init();
	animate();
})(jQuery);
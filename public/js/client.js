(function($)
{
	var socket = io();
	var players = [];
	var idPlayer = '';

	$('#loginform').submit(function(e)
	{
		e.preventDefault();
		socket.emit('login',
		{
			username : $('#username').val(),
			mail : $('#mail').val(),
		});
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
	});

	socket.on('disusr',function(id)
	{
		var idPlayerToDelete = 0;
		var i = 0;
		players.forEach(player =>
		{
			if(id == player.id)
			{
				console.log('suppression de'+ player.id);
				var idPlayerToDelete = i;
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

 			if(player.y+player.height>=canvas.height)
 			{
 				player.velocity.y = 0;
 				player.y = canvas.height-player.height;
 			}
 			else
 			{
 				player.velocity.y += 1;
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
 			ctx.fillRect(player.x,player.y,player.width,player.height);
 			ctx.fillStyle = player.color;
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
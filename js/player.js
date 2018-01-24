 	function Player(id,x,y,height,color)
 	{
 		this.x = x;
 		this.y = y;
 		this.velocity =
 		{
 			x : 0,
 			y : 5
 		}
 		this.width = 50;
 		this.height = height;
 		this.color = color;
 		this.isOnAir = true;
 		this.id = id;

 		this.update = () =>
 		{
 			//On vérifie l'état avant de faire quoi que ce soit
 			if(this.y+this.height==canvas.height)
 			{
 				this.isOnAir=false;
 			}
 			else
 			{
 				this.isOnAir=true;
 			}

 			if(this.y+this.height>=canvas.height)
 			{
 				this.velocity.y = 0;
 				this.y = canvas.height-height;
 			}
 			else
 			{
 				this.velocity.y += 1;
 			}

 			if(keyPress=='none' && !this.isOnAir)//Si aucune touche n'est pressé et que le joueur n'est pas en l'air
 			{
 				this.velocity.x = 0;
 			}
 			else
 			{
 				if(keyPress=='d')
 				{
 					this.velocity.x += 1;
 				}
 				if(keyPress=='q')
 				{
 					this.velocity.x -= 1;
 				}
 				if(keyPress==' ' && this.velocity.y==0 && !this.isOnAir)
 				{		
 					this.velocity.y -= 20;
 				}	
 			}

 			if(this.x+this.width > canvas.width || this.x-this.width < 0)
 			{
 				if(this.x-this.width < 0)
 				{
 					this.x=this.width;
 				}
 				if(this.x+this.width > canvas.width)
 				{
 					this.x=canvas.width-this.width;
 				}
 				this.velocity.x = 0;
 			}
 			this.y += this.velocity.y;
 			this.x += this.velocity.x;
 			this.draw();
 		}

 		this.draw = () => 
 		{
 			ctx.fillRect(this.x,this.y,this.width,this.height);
 			ctx.fillStyle = this.color;
 		}
 	}

 	var exports = module.exports = {};

 	exports.new = function(id,x,y,height,color)
 	{
 			return new Player(id,x,y,height,color);
 	};
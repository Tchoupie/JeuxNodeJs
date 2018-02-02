	//Variable + initialisation de canvas
 	const canvas = document.querySelector('canvas');
 	ctx = canvas.getContext('2d');

 	canvas.width = 1000;
 	canvas.height = 500;
 	ctx.imageSmoothingEnabled = false;
 	var keyPress = 'none';
 	var lastKeyPress = 'none';

 	window.addEventListener('keydown',function(e)
 	{
 		keyPress = e.key;
 		if(e.key=='d' || e.key=='q')
 		{
 			lastKeyPress = keyPress;
 		}
 	});

 	window.addEventListener('keyup',function(e)
 	{

 		console.log(lastKeyPress);
 		if(e.key=='d' || e.key=='q')
 		{
 			if((e.key=='d' && lastKeyPress=='q') || (e.key=='q' && lastKeyPress=='d'))
 			{
 				keyPress = lastKeyPress;
 			}
 			else
 			{
 				keyPress = 'none';	
 				lastKeyPress = 'none';
 			}
 		}

 		if(e.key==' ')
 		{ 
 			if((lastKeyPress=='q' || lastKeyPress=='d'))
 			{
 				keyPress=lastKeyPress;
 			}
 			else
 			{
 				keyPress='none';
 			}
 		}
 	});
 	//Objet particule
 	function Particle(x,y,radius,color)
 	{
 		this.x = x;
 		this.y = y;
 		this.velocity = {
 			x : Math.random() - 0.5,
 			y : Math.random() - 0.5
 		}
 		this.radius = radius;
 		this.color = color;
 		this.mass = 1;

 		this.update = particles => 
 		{
 			this.draw();

 			for (let i = 1; i < particles.length; i++) 
 			{
 				if(this === particles[i])
 				{
 					continue;
 				}
 				if(getDistance(this.x,this.y,particles[i].x,particles[i].y) - radius*2 < 0)
 				{
 					resolveCollision(this, particles[i]);
 				}
 			}

 			if(this.x - this.radius <=0 || this.x + this.radius >=canvas.width)
 			{
 				this.velocity.x = -this.velocity.x;
 			}
 			if(this.y - this.radius <=0 || this.y + this.radius >=canvas.height)
 			{
 				this.velocity.y = -this.velocity.y;
 			}
 			this.x += this.velocity.x;
 			this.y += this.velocity.y;
 		}

 		this.draw = () =>
 		{
 			ctx.beginPath();
 			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
 			ctx.strokeStyle = this.color;
 			ctx.stroke();
 			ctx.closePath();
 		}  
 	}

 	function Player(x,y,height,color)
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

 	function rotate(velocity,angle)
 	{
 		const rotatedVelocities = 
 		{
 			x : velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
 			y : velocity.y * Math.sin(angle) + velocity.y * Math.cos(angle),
 		}
 		return rotatedVelocities;
 	}

 	function resolveCollision(particle, otherParticle)
 	{
 		const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
 		const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

 		const xDist = otherParticle.x - particle.x;
 		const yDist = otherParticle.y - particle.y;

 		if(xVelocityDiff * xDist + yVelocityDiff * yVelocityDiff >=0)
 		{
 			//On récupère la tangente (c'est à dire le point ou ce touche les deux particules)
 			const angle = -Math.atan2(yDist,xDist);

 			//On récupère la masse des particules
 			const m1 = particle.mass;
 			const m2 = otherParticle.mass;

 			//Rotation des deux particules en fonction de l'angle (pour que l'équation fonctionne)
 			const u1 = rotate(particle.velocity, angle);
 			const u2 = rotate(otherParticle.velocity,angle);

 			//Vélocité après la collision (équation One dimensional newtonian)
 			const v1 = 
 			{
 				x : u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), 
 				y : u1.y
 			};

 			const v2 = 
 			{
 				x : u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), 
 				y : u2.y
 			};

 			//On se remet dans le bon sens
 			vFinal1 = rotate(v1, -angle);
 			vFinal2 = rotate(v2, -angle);

 			//On ajoute cette vélocité à nos deux particules 
 			particle.velocity.x = vFinal1.x;
 			particle.velocity.y = vFinal1.y;

 			otherParticle.velocity.x = vFinal2.x;
 			otherParticle.velocity.y = vFinal2.y;
 		}
 	}

 	function randomIntFromRange(min, max)
 	{
 		return Math.floor(Math.random() * (max - min + 1) + min)
 	}

 	function getDistance(x1,y1,x2,y2)
    {
        xDistance = x2-x1;
        yDistance = y2-y1;
        return Math.sqrt(Math.pow(xDistance,2) + Math.pow(yDistance,2));
    }

    let particles;
    let player;

 	function init()
 	{
 		// particles = [];
 		// for(let i = 0; i < 20; i++)
 		// {	
 		// 	const radius = 60;
 		// 	let x = randomIntFromRange(radius, canvas.width - radius);
 		// 	let y = randomIntFromRange(radius, canvas.height - radius);
 		// 	const color = 'blue';

 		// 	if(i != 0)
 		// 	{
 		// 		for(let j = 0; j<particles.length;j++)
 		// 		{
 		// 			if(getDistance(x, y, particles[j].x, particles[j].y) - radius*2 < 0)
 		// 			{
 		// 				x = randomIntFromRange(radius, canvas.width - radius);
 		// 				y = randomIntFromRange(radius, canvas.height - radius);
 		// 				j = -1;
 		// 			}
 		// 		}
 		// 	}

 		// 	particles.push(new Particle(x,y,radius,color));
 		// }

 		let height=50;
 		let x=60;
 		let y=50;
 		let color = 'red';
 		player = new Player(x,y,height,color);
 	}

 	function animate()
 	{
 		requestAnimationFrame(animate);
 		ctx.clearRect(0,0,canvas.width,canvas.height);
 		// particles.forEach(particle => 
 		// {
 		// 	particle.update(particles);
 		// });
 	}

 	// init();
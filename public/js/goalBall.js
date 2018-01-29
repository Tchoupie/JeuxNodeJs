function GoalBall(x,y,radius,color)
{
	this.x = x;
 	this.y = y;
 	this.radius = radius;
 	this.color = color;

 	this.update = function()
	{
		this.draw();
	}

	this.draw = function()
	{
		ctx.beginPath();
 		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
 		ctx.fillStyle = this.color;
 		ctx.fill();
 		ctx.closePath();
	}	
}

var exports = module.exports = {};

exports.new = function(x,y,radius,color)
{
 	return new GoalBall(x,y,radius,color);
};
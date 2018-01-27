function Obstacle(x,y,width,height,color)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;

	this.update = function()
	{
		this.draw();
	}

	this.draw = function()
	{
		ctx.fillRect(this.x,this.y,this.width,this.height);
 		ctx.fillStyle = this.color;
	}
}

 	var exports = module.exports = {};

 	exports.new = function(x,y,width,height,color)
 	{
 		return new Obstacle(x,y,width,height,color);
 	};
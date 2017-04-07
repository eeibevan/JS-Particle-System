function ExplodeActor(x, y, width, color, explodeTicks, isFuseLit) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.color = color || 'red';
    this.explodeTicks = explodeTicks || 50;
    this._isFuseLit = isFuseLit || false;
    this._playExplodeAnimation = false;
    this._flash = false;
    this.explosion = {
        width: width,
        growth: 17,
        frames: 10,
        color: 'white'
    };
    this.isToDie = false;
    this.text  = 'Ex';
    this.textColor = 'white';
    this.fontFamily = "Consolas";
}

ExplodeActor.prototype.explode = function (system) {
    var particles = system.particles;
    var distance = 0;
    for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        var dx = this.x - particle.x;
        var dy = this.y - particle.y;
        distance = Math.sqrt( dx * dx + dy * dy);
        if (distance < 100)
            particle.isToDie = true;
    }
};

ExplodeActor.prototype.act = function (system) {
    if (this._isFuseLit)
        if (--this.explodeTicks <= 0) {
            this.explode(system);
            this._isFuseLit = false;
            this._playExplodeAnimation = true;
        }
};

ExplodeActor.prototype.isInBounds = function (x, y) {
    var isInX = x > this.x && x < this.x + this.width;
    var isInY = y > this.y && y < this.y + this.width;
    return isInX && isInY;
};

ExplodeActor.prototype.onContact = function (particle) {
    this._isFuseLit = true;
};

ExplodeActor.prototype._drawText = function (ctx) {
    // Save Composite Operation To Restore Later
    var oldCO = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'source-atop';

    ctx.fillStyle = this.textColor;
    ctx.font = Math.ceil(this.width/2) + "px " + this.fontFamily;

    var textWidth = ctx.measureText(this.text).width;
    // Height May be Approximated By The Width of A Capital E
    var textHeight = ctx.measureText('E').width;

    // Draws Text In The Center of The Actor
    ctx.fillText(this.text, this.x + textWidth/2, this.y + textHeight*2);

    ctx.globalCompositeOperation = oldCO;
};

ExplodeActor.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;

    // Alternate Flashing If Fuse Is Lit
    if (this._isFuseLit) {
        if (this._flash) {
            ctx.fillStyle = 'white';
            this._flash = false
        } else
            this._flash = true;
    }

    ctx.fillRect(this.x, this.y, this.width, this.width);
    this._drawText(ctx);

    if (this._playExplodeAnimation && this.explosion.frames > 0) {
        this.drawExplosionFrame(ctx);
        this.explosion.width += this.explosion.growth;
        this.explosion.frames--;
    }

    if (this.explosion.frames < 1) {
        this._playExplodeAnimation = false;
        this.isToDie = true;
    }
};

ExplodeActor.prototype.drawExplosionFrame = function (ctx) {
    ctx.beginPath();
    ctx.globalCompositeOperation = "lighter";

    var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.explosion.width);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.4, "white");
    gradient.addColorStop(0.4, this.explosion.color);
    gradient.addColorStop(1, "black");

    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.explosion.width, 0, Math.PI*2, false);
    ctx.fill();
};

ActorFactory.prototype.makeExplode = function (x, y, width, color, explodeTicks, isFuseLit) {
    return new ExplodeActor(x, y, width, color, explodeTicks, isFuseLit);
};

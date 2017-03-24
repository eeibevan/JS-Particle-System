/**
 * Builds A Random rgba String
 *
 * @returns {string}
 * A rgba String With The Following Ranges
 * rgba([0-255],[0-255],[0-255],1)
 */
function randomRgbColor() {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var a = .5;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

function Particle(x, y, deltaX, deltaY, radius, color) {
    this.x = x || 0;
    this.y = y || 0 ;
    this.deltaX = deltaX || 0;
    this.deltaY = deltaY || 0;
    this.radius = radius || Math.floor(Math.random() * 20);
    this.color = color || randomRgbColor();
}

Particle.prototype.draw = function (ctx) {
    var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.4, "white");
    gradient.addColorStop(0.4, this.color);
    gradient.addColorStop(1, "black");

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    ctx.fill();
};

function ParticleSystem(n, xBound, yBound) {
    this.particles = [];
    this.actors = [];
    this.xBound = xBound;
    this.yBound = yBound;
    this.actorFactor = new ActorFactory();
    this.seed(n)
}

ParticleSystem.prototype.seed = function (n) {
    for (var i = 0; i < n; i++)
        this.particles.push(new Particle(1, 1, Math.random(), Math.random()));
    this.actors.push(this.actorFactor.makeNull(this.xBound/2 - 10, this.yBound/2 - 10 , 20, 'white'));
    this.actors.push(this.actorFactor.makeProducer(100, 200, 5, 200, 'green'));
};

ParticleSystem.prototype.update = function () {
    for (var i = 0; i < this.particles.length; i++) {
        var par = this.particles[i];
        par.x += par.deltaX;
        par.y += par.deltaY;

        for (var j = 0; j < this.actors.length; j++) {
            if (this.actors[j].isInBounds(par.x, par.y)) {
                this.actors[j].onContact(par);
            }
        }

        if (par.x > this.xBound || par.x < 0)
            par.deltaX = -par.deltaX;
        if (par.y > this.yBound || par.y < 0)
            par.deltaY = -par.deltaY;
    }

    for (var k = 0; k < this.actors.length; k++) {
        this.actors[k].act(this);
    }
};

function CanvasInteractor(canvas, particleSystem) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.particleSystem = particleSystem || new ParticleSystem(50, canvas.width, canvas.height);

    window.requestAnimationFrame(this.startUpdates.bind(this))
}

CanvasInteractor.prototype.startUpdates = function () {
    this.update();
    this.draw();
    window.requestAnimationFrame(this.startUpdates.bind(this));
};

CanvasInteractor.prototype.draw = function () {
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);

    //Lets blend the particle with the BG
	this.ctx.globalCompositeOperation = "lighter";

    this.particleSystem.particles.forEach(function (particle) {
        particle.draw(this.ctx);
    }.bind(this));

    this.particleSystem.actors.forEach(function (actor) {
        actor.draw(this.ctx);
    }.bind(this))
};

CanvasInteractor.prototype.update = function () {
    this.particleSystem.update();
};
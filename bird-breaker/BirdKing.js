class BirdKing extends Bird {

    constructor(pos) {
        // Inherit the base methods of the bird object.
        super(pos);

        this.radius *= 3;
        this.lives = 5;

        // How many bird minions he summons per hit.
        this.power = 8;
        // Controls the Bird King's bird rain.
        this.birdRain = false;
        // Lightning occurs whenever the Bird King is struck with a ball.
        this.lightning = 0;
    }

    hit() {
        if (this.birdRain == false && !this.falling) {
            this.lives -= 1;

            // Summon minions
            for (var i = 0; i < this.power; i++) {
                var angle = 2*pi * Math.random();
                var radius = 3 * this.radius;
                var bird = new BirdMinion(this.pos.getShifted(Vector2D.FromPolar(angle, radius)), this, radius, angle);
                GC.birds.push(bird);
            }
        }

        if (this.lives <= 0) {
            this.falling = true;
        }

        this.birdRain = true;
        this.lightning = 1;
    }

    display() {
        fill(100, 100, 100);
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);

        var xSize = this.radius / 2;
        if (this.falling) {
            // Draw little "x"s over the eye regions to signify that the bird is falling/dead.
            stroke(255, 255, 255);
            strokeWeight(xSize/2);
            // Left eye
            line(this.pos.x - 3/2 * xSize, this.pos.y - xSize/2, this.pos.x - xSize/2, this.pos.y + xSize/2);
            line(this.pos.x - 3/2 * xSize, this.pos.y + xSize/2, this.pos.x - xSize/2, this.pos.y - xSize/2);
            // Right eye
            line(this.pos.x + 1/2 * xSize, this.pos.y - xSize/2, this.pos.x + 3/2 * xSize, this.pos.y + xSize/2);
            line(this.pos.x + 1/2 * xSize, this.pos.y + xSize/2, this.pos.x + 3/2 * xSize, this.pos.y - xSize/2);
        }
        else {
            // Draw massive white, creepy eyes for the Bird King.
            fill(255, 255, 255);
            ellipse(this.pos.x - xSize, this.pos.y - 1/4 * xSize, 3/4 * xSize, 3/4 * xSize);
            ellipse(this.pos.x + xSize, this.pos.y - 1/4 * xSize, 3/4 * xSize, 3/4 * xSize);
        }

        this.displayLightning();

        if (this.birdRain) {
            // Summon dead birds, randomly.
            if (Math.random() < 0.1) {
                GC.birds.push(new Bird(new Vector2D(HALFWIDTH * (2*Math.random() - 1), -HEIGHT)));
                GC.birds[GC.birds.length - 1].falling = true;
            }
            // Stop the bird rain, eventually.
            if (Math.random() < 0.01) {
                this.birdRain = false;
            }
        }
    }

    displayLightning() {
        if (this.lightning > 0) {
            this.lightning -= (millis() - GC.prevTime) / 1000;
        }

        fill(255, 255, 255, Math.pow(this.lightning, 3));
        rect(0, 0, WIDTH, HEIGHT);
    }

}

class BirdMinion extends Bird {

    constructor(pos, master, circlingRadius, angle) {
        // Inherit the base methods of the bird object.
        super(pos);

        // Circle the master to protect them.
        this.master = master;
        // The radius at which to circle at.
        this.circlingRadius = circlingRadius;
        this.angle = angle;

        this.deathMode = false;
        this.sickly = 0;
    }

    wiggle() {
        // Wiggle around, now, if it's not falling.
        if (this.falling == false) {
            // Circle the master, if he's not dead.
            if (this.master.falling == false) {
                this.anchorPos = this.master.pos.getShifted(Vector2D.FromPolar(this.angle + millis() / 500, this.circlingRadius));
            }
            else {
                // If the master is dead, begin deathMode, which will kill the birds very, very fast.
                this.deathMode = true;
            }
            // wiggle
            var old = this.pos.clone();
            this.pos = this.anchorPos.getShifted(new Vector2D(Math.cos((millis() + this.wiggleNumber) / (100*pi)), 1/2 * Math.sin((millis() + this.wiggleNumber) / (50*pi))).getScaled(this.radius / 2));
            this.vel = this.pos.getShifted(old.getScaled(-1));
        }
    }

    display() {
        fill(100 - this.sickly, 100 + this.sickly, 100 - this.sickly);
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);

        var xSize = this.radius / 2;
        if (this.falling) {
            // Draw little "x"s over the eye regions to signify that the bird is falling/dead.
            stroke(255, 255, 255);
            strokeWeight(xSize/2);
            // Left eye
            line(this.pos.x - 3/2 * xSize, this.pos.y - xSize/2, this.pos.x - xSize/2, this.pos.y + xSize/2);
            line(this.pos.x - 3/2 * xSize, this.pos.y + xSize/2, this.pos.x - xSize/2, this.pos.y - xSize/2);
            // Right eye
            line(this.pos.x + 1/2 * xSize, this.pos.y - xSize/2, this.pos.x + 3/2 * xSize, this.pos.y + xSize/2);
            line(this.pos.x + 1/2 * xSize, this.pos.y + xSize/2, this.pos.x + 3/2 * xSize, this.pos.y - xSize/2);
        }

        // If deathMode is true, begin dying.
        if (this.deathMode) {
            if (Math.random() < (this.sickly / 25) / 250) {
                this.falling = true;
            }

            if (this.sickly < 25) {
                this.sickly += Math.random() * ((millis() - GC.prevTime) / 250);
            }
        }
    }

}

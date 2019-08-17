class Bird {

    constructor(pos) {
        this.pos = pos;
        this.vel = new Vector2D(0, 0);
        this.anchorPos = pos;
        this.destination = pos;
        this.radius = WIDTH / 50;
        this.isCircle = true;

        this.falling = false;
        this.fallingVel = 0;
        // Affecting the propeller is only a once per bird action.
        this.canAffectPropeller = true;
        
        // If false, the bird still gets hit but the ball won't bounce off it.
		this.hitbox = true;

        // Determines how often coins are dropped and, if they are, how many.
        // 0.1 = 10% chance for a bird to drop coins.
        this.coinChance = 0.1;
        // Base coins are automatically always dropped. Then there's a 50% chance for every next coin to be dropped. For example, for 5 coins to be dropped, you have 2 automatically, then 3 by luck. Each is 50% = 0.5, and 0.5*0.5*0.5 = 0.125, or 1/8 chance.
        this.baseCoins = 2;
        this.nextChance = 0.5;

        this.wiggleNumber = 10000 * (Math.random()*2 - 1);
        this.flyInNumbers = [pi*(Math.random()*2 - 1), pi*(Math.random()*2 - 1), (Math.random() + 1) / 2 - 0.25, Math.floor(Math.random() * 2)*2 - 1];
    }

    hit() {
        if (this.falling == false) {
            // Throw off coins, randomly.
            if (Math.random() > 1 - this.coinChance) {
                var coinNum = this.baseCoins;
                while (Math.random() > 1 - this.nextChance) {
                    coinNum += 1;
                }

                for (var i = 0; i < coinNum; i++) {
                    var angle = pi*(1 + Math.random());
                    GC.coins.push(new Coin(this.pos.clone(), Vector2D.FromPolar(angle, this.radius/20)));
                }
            }
        }

        this.falling = true;
        
        return this.hitbox;
    };

    fall() {
        if (this.falling) {
            this.fallingVel += GRAVITY;
            this.vel = new Vector2D(0, this.fallingVel);
            this.pos.y += this.fallingVel;

            // Check if the bird has gotten stuck in the plane's propeller.
            this.inPropeller();

            // Check if the bird has fallen out of the screen.
            if (this.pos.y > HALFHEIGHT) {
                GC.birds.splice(GC.birds.indexOf(this), 1);
            }
        }
    };

    inPropeller() {
        if (this.canAffectPropeller) {
            for (var i = 0; i < GC.plane.parts["propellers"].length; i++) {
                var propeller = GC.plane.parts["propellers"][i];

                var distSquared = Math.pow(this.pos.x - GC.plane.pos.getShifted(propeller.pos).x, 2) + Math.pow(this.pos.y - GC.plane.pos.getShifted(propeller.pos).y, 2);
                var radiiSquared = Math.pow(this.radius + propeller.radius, 2);
                if (distSquared <= radiiSquared) {
                    this.canAffectPropeller = false;
                    // The plane's engine reliability must be reduced.
                    GC.plane.engineReliability = 4*Math.random() - 1;
                }
            }
        }
    }

    wiggle() {
        // Wiggle around, now, if it's not falling.
        if (this.falling == false) {
            var old = this.pos.clone();
            this.pos = this.anchorPos.getShifted(new Vector2D(Math.cos((millis() + this.wiggleNumber) / (100*pi)), 1/2 * Math.sin((millis() + this.wiggleNumber) / (50*pi))).getScaled(this.radius / 2));
            this.vel = this.pos.getShifted(old.getScaled(-1));
        }
    }

    display() {
        fill(100, 100, 100);
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);

        if (this.falling) {
            // Draw little "x"s over the eye regions to signify that the bird is falling/dead.
            var xSize = this.radius / 2;
            stroke(255, 255, 255);
            strokeWeight(xSize/2);
            // Left eye
            line(this.pos.x - 3/2 * xSize, this.pos.y - xSize/2, this.pos.x - xSize/2, this.pos.y + xSize/2);
            line(this.pos.x - 3/2 * xSize, this.pos.y + xSize/2, this.pos.x - xSize/2, this.pos.y - xSize/2);
            // Right eye
            line(this.pos.x + 1/2 * xSize, this.pos.y - xSize/2, this.pos.x + 3/2 * xSize, this.pos.y + xSize/2);
            line(this.pos.x + 1/2 * xSize, this.pos.y + xSize/2, this.pos.x + 3/2 * xSize, this.pos.y - xSize/2);
        }
    }

}

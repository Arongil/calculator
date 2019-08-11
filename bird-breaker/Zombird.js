class Zombird extends Bird {

    constructor(pos) {
        // Inherit the base methods of the bird object.
        super(pos);

        this.r = 120 + 20*Math.random();
        this.g = 120 + 40*Math.random();
        this.b = 120 + 40*Math.random();

        // Stores whether the zombird has died already.
        this.undead = false;
        // The y-value at which the zombird will become undead.
        this.undeadY = -HEIGHT/6 + HEIGHT/3 * Math.random();
    }

    display() {
        var undeadPercent = 0;
        if (this.falling) {
            undeadPercent = 1 - (this.pos.y - this.undeadY) / (this.anchorPos.y - this.undeadY);
        }

        if (!this.undead) {
            var fillUndeadPercent = undeadPercent*undeadPercent; // Make the fill transition slower.
            fill(fillUndeadPercent*240 + (1 - fillUndeadPercent) * this.r, fillUndeadPercent*240 + (1 - fillUndeadPercent) * this.g, fillUndeadPercent*240 + (1 - fillUndeadPercent) * this.b, fillUndeadPercent * 0.8 + (1 - fillUndeadPercent));
        } else {
            fill(240, 240, 240, 0.8);
        }
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);

        var xSize = this.radius / 2;
        if (this.falling || this.undead) {
            // Draw little "x"s over the eye regions to signify that the bird is falling/dead.
            if (!this.undead) {
                stroke(255, undeadPercent*180 + (1 - undeadPercent)*255, undeadPercent*180 + (1 - undeadPercent)*255);
            } else {
                stroke(255, 180, 180);
            }
            strokeWeight(xSize/2);
            // Left eye
            line(this.pos.x - 3/2 * xSize, this.pos.y - xSize/2, this.pos.x - xSize/2, this.pos.y + xSize/2);
            line(this.pos.x - 3/2 * xSize, this.pos.y + xSize/2, this.pos.x - xSize/2, this.pos.y - xSize/2);
            // Right eye
            line(this.pos.x + 1/2 * xSize, this.pos.y - xSize/2, this.pos.x + 3/2 * xSize, this.pos.y + xSize/2);
            line(this.pos.x + 1/2 * xSize, this.pos.y + xSize/2, this.pos.x + 3/2 * xSize, this.pos.y - xSize/2);
        }
    }

    fall() {
        if (this.falling) {
            this.fallingVel += GRAVITY/2;
            this.vel = new Vector2D(0, this.fallingVel);
            this.pos.y += this.fallingVel;

            // Check if the bird has gotten stuck in the plane's propeller.
            this.inPropeller();

            // Check if the bird has fallen out of the screen.
            if (!this.undead) {
                if (this.pos.y > (this.anchorPos.y + this.undeadY)/2) {
                    this.fallingVel -= GRAVITY;
                    if (this.fallingVel < 0) {
                        this.undead = true;
                        this.fallingVel = 0;
                        this.anchorPos = this.pos.clone();
                        this.falling = false;
                    }
                }
            } else {
                if (this.pos.y > HALFHEIGHT) {
                    GC.birds.splice(GC.birds.indexOf(this), 1);
                }
            }
        }
    }

}

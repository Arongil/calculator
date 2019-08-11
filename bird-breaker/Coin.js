class Coin {

    constructor(pos, vel) {
        this.pos = pos;
        this.vel = vel;

        this.radius = WIDTH / 50;

        this.theta = 0;
        this.omega = (2*Math.random() - 1)/4;
    }

    updatePhysics() {
        // Apply gravity
        this.vel.y += GRAVITY/2;

        // Rotate
        this.theta += this.omega;

        this.pos.shift(this.vel);

        if (this.pos.y > HALFHEIGHT) {
            GC.coins.splice(GC.coins.indexOf(this), 1);
            GC.player.coins += 1;
            GC.player.coinDisplay = 3*fps;
        }
    }

    display() {
        ctx.save();

        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.theta);

        fill(210, 210, 25);
        ellipse(0, 0, this.radius, this.radius);

        fill(0, 0, 0);
        textSize(3/2*this.radius);
        text("$", 0, this.radius/2);

        ctx.restore();
    }

}

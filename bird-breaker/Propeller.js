class Propeller {

    constructor(pos, radius) {
        this.pos = pos;
        this.theta = 0;

        this.radius = radius;
        this.isCircle = true;

        this.rotateSpeed = pi / 11;
    }

    display() {
        ctx.save();

        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.theta);

        fill(200, 200, 200, 0.588);
        rect(0, 0, 2*this.radius, 4/9 * this.radius);
        ctx.rotate(pi / 2);
        fill(175, 175, 175);
        rect(0, 0, 2*this.radius, 4/9 * this.radius);

        ctx.restore();

        fill(220, 220, 220);
        if (debug) {
            // Fill a magical color alert the user if debug is on.
            fill(255, 0, 0);
            stroke(255, 0, 0);
        }
        ellipse(this.pos.x, this.pos.y, 2/15 * this.radius, 2/15 * this.radius);

        // Spin the blade.
        this.theta += this.rotateSpeed;
    }
}

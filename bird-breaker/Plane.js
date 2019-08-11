class Plane {
    constructor(parts) {
        this.pos = new Vector2D(0, 4/5 * HALFHEIGHT);
        this.theta = 0;
        this.omega = 0;
        this.vel = 0;
        this.velEquivalent;

        this.parts = parts;

        // At 0 there are no malfunctions. At 1 (or -1) everything malfunctions. There's a spectrum between -1 and 1.
        this.engineReliability = 0;
        // How fast a malfunctioning engine returns to normal. 0 is never, one is instantly.
        this.engineRecovery = 0.1;
        // How much an unreliabable engine is affected. Scalar from 0 (no ill effects) to 1 (full effects).
        this.baseReliability = 0.25;

        this.turnSpeed = 0.004;
        this.speed = WIDTH / 50;

        this.drag = 0.95;
        this.angularDrag = 0.90;
    }

    updatePhysics() {
        this.engine();

        // Left
        if (InputFlags["37"]) {
            this.omega += this.turnSpeed;
        }
        // Right
        if (InputFlags["39"]) {
            this.omega -= this.turnSpeed;
        }

        if (GC.ai && GC.screen == "game" && !(InputFlags["37"] || InputFlags["39"])) {
            // artificial unintelligence, TM
            // Always move toward the ball, with a preference toward where it's heading.
            this.omega += this.turnSpeed * (2 / (1 + Math.exp((-this.pos.x + GC.ball.pos.x + GC.ball.vel.x*20)*20/WIDTH)) - 1);
        }

        // Apply drag to omega and vel
        this.omega *= this.angularDrag;
        this.vel *= this.drag;

        // Counteract rotation, proportionately to theta
        this.omega -= 6*this.theta / pi * this.turnSpeed;

        // Rotate, based on omega
        this.theta += this.omega;

        // Apply a "wind force", proportional to the distance from the center
        this.theta += Math.pow(2*this.pos.x / HALFWIDTH, 5) * this.turnSpeed;
        if (this.pos.x < -HALFWIDTH || this.pos.x > HALFWIDTH) {
            this.vel -= this.pos.x / HALFWIDTH;
        }

        // Move the plane, based on theta
        this.pos.x -= Math.sin(this.theta) * this.speed;

        // Change position, based on vel
        this.pos.x += this.vel;

        this.velEquivalent = -Math.sin(this.theta) * this.speed + this.vel;
    }

    engine() {
        // Let engine reliability drift to 0.
        this.engineReliability -= this.engineRecovery * this.engineReliability;

        // Tilt unpredictably, in proportion to engine reliability.
        this.omega += (2*Math.random() - 1) * this.baseReliability * this.engineReliability;
    }

    display() {
        ctx.save();

        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(-this.theta);

        fill(30, 60, 120);
        for (var i = 0; i < this.parts["rects"].length; i++) {
            var curRect = this.parts["rects"][i];

            ctx.save();
            ctx.translate(curRect.x, curRect.y);
            ctx.rotate(-curRect.theta);

            if (curRect.color !== undefined) {
                fill(curRect.color[0], curRect.color[1], curRect.color[2]);
            }
            rect(0, 0, curRect.width, curRect.height);
            ctx.restore();
        }
        for (var i = 0; i < this.parts["circles"].length; i++) {
            var curCircle = this.parts["circles"][i];

            if (curCircle.color !== undefined) {
                fill(curCircle.color[0], curCircle.color[1], curCircle.color[2]);
            }
            ellipse(curCircle.x, curCircle.y, curCircle.radius/2, curCircle.radius/2);
        }

        for (var i = 0; i < this.parts["propellers"].length; i++) {
            this.parts["propellers"][i].display();
        }

        ctx.restore();
    }
}

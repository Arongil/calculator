class Ball {

    constructor() {
        this.pos = new Vector2D(0, 0);
        this.vel = new Vector2D(0, 0);
        this.startSpeed = WIDTH / 200;
        this.theta = pi*(Math.random()/4 + 3/8);

        this.radius = WIDTH / 60;
        this.boostVel = WIDTH / 40;
        this.equilibriumVel = WIDTH / 100;
        this.boostTimer = 0; // Boosts can only happen if boostTimer = 0.

        this.uncollideSteps = 10; // Precision of collision rectification. Higher is exponentially better and more computationally intensive.
        this.collisionAccuracy = 5; // Precision of collision detection. Higher is linearly better and more computationally intensive.
    }

    reset() {
        this.pos = new Vector2D(0, 0);
        this.vel = Vector2D.FromPolar(pi*(Math.random()/4 + 3/8), this.startSpeed);
    }
    corrections() {
        // The game is boring when the ball travels in a flat horizontal
        // line for longer than a few seconds. To combat this, multiply the
        // angle by a small scaling factor whenever it gets too shallow.
        const cutoff = pi/16;
        const correction = 1.01;
        var angle = Math.atan2(this.vel.y, this.vel.x);
        if (Math.abs(angle) < cutoff) {
            angle *= correction;
        } else if (Math.abs(angle - pi) < cutoff) {
            angle -= pi;
            angle *= correction;
            angle += pi;
        }

        // Apply a drag force until the ball reaches its equilibrium speed.
        const velMag = this.vel.getMagnitude();
        var newMag = velMag + 0.025 * (this.equilibriumVel - velMag);
        this.vel = Vector2D.FromPolar(angle, newMag);

        this.vel.scale(newMag / velMag);
        if (debug) {
            // Draw markers around the ball representing its cutoff for velocity adjustment.
            stroke(255, 0, 0);
            strokeWeight(2);
            line(this.pos.x, this.pos.y, this.pos.x + WIDTH/10 * Math.cos(cutoff), this.pos.y + WIDTH/10 * Math.sin(cutoff));
            line(this.pos.x, this.pos.y, this.pos.x + WIDTH/10 * Math.cos(cutoff), this.pos.y - WIDTH/10 * Math.sin(cutoff));
            line(this.pos.x, this.pos.y, this.pos.x - WIDTH/10 * Math.cos(cutoff), this.pos.y + WIDTH/10 * Math.sin(cutoff));
            line(this.pos.x, this.pos.y, this.pos.x - WIDTH/10 * Math.cos(cutoff), this.pos.y - WIDTH/10 * Math.sin(cutoff));
            stroke(0, 0, 0);
            strokeWeight(1);
            line(this.pos.x, this.pos.y, this.pos.x + WIDTH/14 * velMag / this.equilibriumVel * Math.cos(angle), this.pos.y + WIDTH/14 * velMag / this.equilibriumVel * Math.sin(angle));
        }
    }
    updatePhysics() {
        // Divide the movement of the ball into steps so that it doesn't move
        // through objects.
        var steps = Math.ceil(this.vel.getMagnitude() / this.radius * this.collisionAccuracy);

        // Assume that the collisionObjects array will stay static for the frame.
        this.cachedCollisionObjects = this.getCollisionObjects();

        for (var i = 0; i < steps; i++) {
            this._updatePhysics( 1 / steps );
        }

        if (this.boostTimer > 0) {
            this.boostTimer--;
        }

        this.corrections();
    }
    _updatePhysics(t = 1, depth = 1) {
        if (depth > 10 || t <= 0)
            return;

        this.pos.shift(this.vel.getScaled(t));

        this.boundaryCollisions();

        // Collision algorithm. Move the ball its full velocity, then check
        // whether it collided. If it did, binary search back the frame's
        // velocity until we find the exact collision point. Update the ball's
        // velocity, and updatePhysics from the new point with less time.

        // Array of rects or circles, plus code to run if the collision happens.
        var collisionObjects = this.cachedCollisionObjects;

        var index = -1, ball = new Circle(this.pos.x, this.pos.y, this.radius);
        for (var i = 0; i < collisionObjects.length; i++) {
            var collision = false;
            if (collisionObjects[i].object.isCircle) {
                collision = circleCollision(ball, collisionObjects[i].object).collision;
            }
            else if (collisionObjects[i].object.isRectangle) {
                collision = rectangleCollision(ball, collisionObjects[i].object).collision;
            }
            if (collision) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            if (!collisionObjects[index].code()) {
				// Give the object the option to abort the collision (i.e. an undead zombird).
				return;
			}

            var object = collisionObjects[index].object;

            // There's a collision. Use binary search to find where it happened.
            var vel = this.vel.getShifted(collisionObjects[index].vel.getScaled(-1)), pos;
            var high = 0, low = -1, mid, i;
            for (i = 0; i < this.uncollideSteps; i++) {
                mid = (high + low) / 2;
                pos = this.pos.getShifted( vel.getScaled(mid) );

                collision = false;
                if (object.isCircle)
                    collision = circleCollision(new Circle(pos.x, pos.y, this.radius), object)
                else if (object.isRectangle)
                    collision = rectangleCollision(new Circle(pos.x, pos.y, this.radius), object)

                if (collision.collision) {
                    high = mid; // If the middle box is still inside, then the box needs to go out farther.
                }
                else {
                    low = mid; // If the middle box is not inside anymore, then the box needs to go out less.
                }
            }

            // Get the best accuracy collision from the binary search. (If it ended without a collision, then collision.surfaceAngle is 0.)
            var collisionPos = this.pos.getShifted( vel.getScaled(high) );
            if (object.isCircle)
                collision = circleCollision(new Circle(collisionPos.x, collisionPos.y, this.radius), object)
            else if (object.isRectangle)
                collision = rectangleCollision(new Circle(collisionPos.x, collisionPos.y, this.radius), object)

            // Shift pos to be out of the collision.
            this.pos.shift( vel.getScaled(low) );

            if (debug) {
                stroke(0, 0, 0);
                strokeWeight(WIDTH/100);
                var collisionPos = pos.getShifted(Vector2D.FromPolar(Math.atan2(vel.y, vel.x), this.radius));
                var perpVector = Vector2D.FromPolar(collision.surfaceAngle, WIDTH/10);
                var end1 = collisionPos.getShifted(perpVector.getScaled(-1)),
                    end2 = collisionPos.getShifted(perpVector);
                line(end1.x, end1.y, end2.x, end2.y);
                // ellipse(collisionPos.x, collisionPos.y, WIDTH/60, WIDTH/60);
            }

            this.collision(collision.surfaceAngle);
            this._updatePhysics(t - 1 - low, depth + 1);
        }
    }

    boundaryCollisions() {
        var x = this.pos.x, y = this.pos.y;
        // Boundary collisions.
        if (x <= -HALFWIDTH + this.radius) {
            this.pos.x = -HALFWIDTH + this.radius;
            this.collision(Math.PI/2);
        }
        if (x >= HALFWIDTH - this.radius) {
            this.pos.x = HALFWIDTH - this.radius;
            this.collision(Math.PI/2);
        }
        if (y <= -HALFHEIGHT + this.radius) {
            this.pos.y = -HALFHEIGHT + this.radius;
            this.collision(0);
        }
        if (y >= HALFHEIGHT - this.radius) {
            this.pos.y = HALFHEIGHT - this.radius;
            this.collision(0);

            if (debug) {
                return;
            }

            GC.lives -= 1;
            GC.setTimer();

            // TIMER CODE, IF WANTED

            this.reset();
        }
    }

    // Collision with stationary objects, or approximate collision with moving ones.
    collision(surfaceAngle) {
        this.vel.reflect(surfaceAngle);
    }

    getCollisionObjects() {
        var collisionObjects = [];

        // BIRDS
        for (var i = 0; i < GC.birds.length; i++) {
            var bird = GC.birds[i];
            collisionObjects.push({
                "object": new Circle(bird.pos.x, bird.pos.y, bird.radius),
                "vel": bird.vel,
                "code": function() { return this.hit(); }.bind(bird)
            });
        }

        // PLANE
        // Propeller
        for (var i = 0; i < GC.plane.parts["propellers"].length; i++) {
            var propeller = GC.plane.parts["propellers"][i];

            var pos = GC.plane.pos.getShifted(propeller.pos.getRotated(-GC.plane.theta));
            collisionObjects.push({
                "object": new Circle(pos.x, pos.y, propeller.radius),
                "vel": new Vector2D(GC.plane.velEquivalent, 0), // CHALLENGE: account for the rotating of the plane part in the velocity calculation.    .getShifted(Vector2D.FromPolar(
                "code": (() => { if (this.boostTimer === 0) { this.boostTimer = 4; var mag = this.vel.getMagnitude(); this.vel.scale( (mag + this.boostVel) / mag ); } return true; }).bind(this)
            });
        }

        // Body
        for (var i = 0; i < GC.plane.parts["rects"].length; i++) {
            var rectangle = GC.plane.parts["rects"][i];
            var theta = GC.plane.theta + rectangle.theta;
            // MADE CHANGE. IF PROBLEMATIC, THEN REMOVE. Take out the .getRotated(GC.plane.theta);
            var pos = GC.plane.pos.getShifted(rectangle.pos.getRotated(-GC.plane.theta));
            collisionObjects.push({
                "object": new Rect(pos.x, pos.y, rectangle.width, rectangle.height, theta),
                "vel": new Vector2D(GC.plane.velEquivalent, 0), // CHALLENGE: account for the rotating of the plane part in the velocity calculation.    .getShifted(Vector2D.FromPolar(
                "code": () => { return true; }
            });
        }
        for (var i = 0; i < GC.plane.parts["circles"].length; i++) {
            var circle = GC.plane.parts["circles"][i];

            var pos = GC.plane.pos.getShifted(circle.pos.getRotated(-GC.plane.theta));
            collisionObjects.push({
                "object": new Circle(pos.x, pos.y, circle.radius),
                "vel": new Vector2D(GC.plane.velEquivalent, 0), // CHALLENGE: account for the rotating of the plane part in the velocity calculation.    .getShifted(Vector2D.FromPolar(
                "code": () => { return true; }
            });
        }

        return collisionObjects;
    }

    getPlaneCollisions() {
        var collisionObjects = [];
    }

    display() {
        var life = GC.TOTALLIVES - GC.lives;
        fill(63 + life*(255-63)/GC.TOTALLIVES, 175 - life*175/GC.TOTALLIVES, 45 - life*45/GC.TOTALLIVES);
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
    }

}

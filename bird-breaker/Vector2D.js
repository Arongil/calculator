class Vector2D {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static FromPolar(angle, radius) {
        return new Vector2D(radius * Math.cos(angle), radius * Math.sin(angle));
    }

    clone() {
        return new Vector2D(this.x, this.y);
    }

    getMagnitude() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    getShifted(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }
    shift(other) {
        this.x += other.x;
        this.y += other.y;
    }

    getScaled(scalar) {
        return new Vector2D(scalar * this.x, scalar * this.y);
    }
    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    getRotated(angle) {
        return new Vector2D(this.x*Math.cos(angle) - this.y*Math.sin(angle), this.x*Math.sin(angle) + this.y*Math.cos(angle));
    }
    rotate(angle) {
        var x = this.x;
        this.x = x*Math.cos(angle) - this.y*Math.sin(angle);
        this.y = x*Math.sin(angle) + this.y*Math.cos(angle);
    }

    getReflected(angle) {
        return new Vector2D(this.x * Math.cos(2*angle) + this.y * Math.sin(2*angle), this.x * Math.sin(2*angle) - this.y * Math.cos(2*angle));
    }
    reflect(angle) {
        var x = this.x, y = this.y;
        this.x = x * Math.cos(2*angle) + y * Math.sin(2*angle);
        this.y = x * Math.sin(2*angle) - y * Math.cos(2*angle);
    }
}

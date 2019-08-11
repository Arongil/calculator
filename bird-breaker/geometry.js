// Shapes

class Rect {

    constructor(x, y, width, height, theta) {
        this.x = x;
        this.y = y;
        this.pos = new Vector2D(this.x, this.y);
        this.width = width;
        this.height = height;
        this.theta = theta;

        this.isRectangle = true;
    }
}

class Circle {

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.pos = new Vector2D(this.x, this.y);
        this.radius = radius;

        this.isCircle = true;
    }
}

// Collisions

function rectangleCollision(circle, rect) {
    // First check bounding boxes as a fast fail case.
    var longside = Math.sqrt(rect.width*rect.width + rect.height*rect.height);
    if (circle.pos.x - circle.radius > rect.pos.x + longside || circle.pos.x + circle.radius < rect.pos.x - longside ||
        circle.pos.y - circle.radius > rect.pos.y + longside || circle.pos.y + circle.radius < rect.pos.y - longside) {
        return {"collision": false, "surfaceAngle": 0};
    }

    /*
        To check for the collision between the rotated rectangle and the circle, first apply a rotation matrix to make the rectangle axis-aligned. Then check collisions as normal!

                ***
               *   *     2------3
               * C *    /      /
               *   *   /      /
                ***   /      /
                     /      /
                    /      /
                   /  R   /
                  /      /
                 /      /
                /      /
               /      /
              /      /
             1------4

    */

    // The origin of the new coordinate system is the center of the rectangle R.
    var unrotatedCirclePos = (circle.pos.getShifted(rect.pos.getScaled(-1))).getRotated(rect.theta); // unrotated C
    var unrotated1 = new Vector2D(-rect.width/2, -rect.height/2), // unrotated corner 1
        unrotated3 = unrotated1.getScaled(-1); // unrotated corner 3

    if (unrotatedCirclePos.x + circle.radius > unrotated1.x && unrotatedCirclePos.x - circle.radius < unrotated3.x &&
        unrotatedCirclePos.y + circle.radius > unrotated1.y && unrotatedCirclePos.y - circle.radius < unrotated3.y) {
        // There's a collision! Now construct four lines, each at a 45 degree angle to a corner. We can use whether the center of the ball is above or below each line to determine whether it's a top, bottom, left, or right hit.
        var y1 = (x) =>  unrotated1.y + (x - unrotated1.x),
            y2 = (x) => -unrotated1.y - (x - unrotated1.x),
            y3 = (x) =>  unrotated1.y - (x + unrotated1.x),
            y4 = (x) => -unrotated1.y + (x + unrotated1.x);
        var above1 = unrotatedCirclePos.y < y1(unrotatedCirclePos.x),
            above2 = unrotatedCirclePos.y < y2(unrotatedCirclePos.x),
            above3 = unrotatedCirclePos.y < y3(unrotatedCirclePos.x),
            above4 = unrotatedCirclePos.y < y4(unrotatedCirclePos.x); // use < because HTML5 canvas draws negative y as up
        var angle;
        if ((!above1 && above2) || (!above3 && above4)) {
            //     left                  right
            angle = Math.PI/2;
        } else {
            // top or bottom
            angle = 0;
        }
        return {"collision": true, "surfaceAngle": angle - rect.theta};
    } else {
        return {"collision": false, "surfaceAngle": 0};
    }
}

function circleCollision(circleA, circleB) {
    // First check bounding boxes as a fast fail case.
    if (circleA.pos.x - circleA.radius > circleB.pos.x + circleB.radius || circleA.pos.x + circleA.radius < circleB.pos.x - circleB.radius ||
        circleA.pos.y - circleA.radius > circleB.pos.y + circleB.radius || circleA.pos.y + circleA.radius < circleB.pos.y - circleB.radius) {
        return {"collision": false, "surfaceAngle": 0};
    }

    var distSquared = Math.pow(circleA.pos.x - circleB.pos.x, 2) + Math.pow(circleA.pos.y - circleB.pos.y, 2);
    var radiiSquared = Math.pow(circleA.radius + circleB.radius, 2);
    if (distSquared <= radiiSquared) {
        // The ball must be deflected off, as if on a surface tangent to the place where the ball hit on the circle of the propeller.
        var diffY = circleA.pos.y - circleB.pos.y;
        var diffX = circleA.pos.x - circleB.pos.x;
        var perpendicularAngle = Math.atan2(diffY, diffX) + Math.PI/2;
        return {"collision": true, "surfaceAngle": perpendicularAngle};
    }
    else {
        return {"collision": false, "surfaceAngle": 0};
    }
}

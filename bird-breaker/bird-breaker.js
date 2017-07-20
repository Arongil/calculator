// Find and replace: Ctrl-shift-f. Type what to replace, enter, and then what to put in it's place.
// Custom planes (infinite possibilities) costs money ($0.99?). Presets cost only in-game money, or coins.
/*
  Ideas:
    Intermediary screen between the play button and the game for the user to pick a level. Have maybe about 5 well made levels, including the basic level created, an endless mode and Bird King.
    For endless and other levels with more than one segment, create the animation to have birds fly into the game. Desmos graph lays out the method for creating realisticly varied, curved flight paths.
*/

var canvas, ctx;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var GRAVITY;

var fps, now;

var GC;

var pi = Math.PI;

var InputFlags = {
  // 37 is left arrow. 39 is right arrow.
  "37": false,
  "39": false,
  "click": false,
  "mousepos": {
    "x": 0,
    "y": 99999
  }
};

var Vector2D = (function() {
  
  function Vector2D(x, y) {
    this.x = x;
    this.y = y;
  }
  
  Vector2D.FromPolar = function(angle, radius) {
    return new Vector2D(radius * Math.cos(angle), radius * Math.sin(angle));
  };
  
  Vector2D.prototype.clone = function() {
    return new Vector2D(this.x, this.y);
  };
  
  Vector2D.prototype.getMagnitude = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  };
  
  Vector2D.prototype.getShifted = function(other) {
    return new Vector2D(this.x + other.x, this.y + other.y);
  };
  Vector2D.prototype.shift = function(other) {
    this.x += other.x;
    this.y += other.y;
  };
  
  Vector2D.prototype.getScaled = function(scalar) {
    return new Vector2D(scalar * this.x, scalar * this.y);
  };
  Vector2D.prototype.scale = function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  };
  
  Vector2D.prototype.getRotated = function(angle) {
    return new Vector2D(this.x*Math.cos(angle) - this.y*Math.sin(angle), this.x*Math.sin(angle) + this.y*Math.cos(angle));
  };
  Vector2D.prototype.rotate = function(angle) {
    var x = this.x;
    this.x = x*Math.cos(angle) - this.y*Math.sin(angle);
    this.y = x*Math.sin(angle) + this.y*Math.cos(angle);
  };
  
  return Vector2D;
}());

var Plane = (function() {
  
  function Plane(parts) {
    this.pos = new Vector2D(0, 4/5 * HALFHEIGHT);
    this.theta = 0;
    this.omega = 0;
    this.vel = 0;
    
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
  
  Plane.prototype.updatePhysics = function() {
    this.engine();
    
    // Left
    if (InputFlags["37"]) {
      this.omega += this.turnSpeed;
    }
    // Right
    if (InputFlags["39"]) {
      this.omega -= this.turnSpeed;
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
  };
  
  Plane.prototype.engine = function() {
    // Let engine reliability drift to 0.
    this.engineReliability -= this.engineRecovery * this.engineReliability;
    
    // Tilt unpredictably, in proportion to engine reliability.
    this.omega += (2*Math.random() - 1) * this.baseReliability * this.engineReliability;
  };
  
  Plane.prototype.display = function() {
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
  };
  
  return Plane;
}());

var Rect = (function() {
  
  function Rect(x, y, width, height, theta, color) {
    this.x = x;
    this.y = y;
    this.pos = new Vector2D(this.x, this.y);
    this.width = width;
    this.height = height;
    this.theta = theta;
    this.color = color;
    
    this.isRectangle = true;
  }
  
  return Rect;
}());

var Circle = (function() {
  
  function Circle(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.pos = new Vector2D(this.x, this.y);
    this.radius = radius;
    this.color = color;
    
    this.isCircle = true;
  }
  
  return Circle;
}());

var Propeller = (function() {
  
  function Propeller(pos, radius) {
    this.pos = pos;
    this.theta = 0;
    
    this.radius = radius;
    this.isCircle = true;
    
    this.rotateSpeed = pi / 11;
  }
  
  Propeller.prototype.display = function() {
    ctx.save();
    
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.theta);
    
    fill(200, 200, 200, 0.588);
    rect(0, 0, this.radius, 2/9 * this.radius);
    ctx.rotate(pi / 2);
    fill(175, 175, 175);
    rect(0, 0, this.radius, 2/9 * this.radius);
    
    ctx.restore();
    
    fill(220, 220, 220);
    ellipse(this.pos.x, this.pos.y, 1/15 * this.radius, 1/15 * this.radius);
    
    // Spin the blade.
    this.theta += this.rotateSpeed;
  };
  
  return Propeller;
}());

var Ball = (function() {
  
  function Ball() {
    this.pos = new Vector2D(0, 0);
    this.vel = WIDTH / 200;
    this.theta = pi*(Math.random()/4 + 3/8);
    
    this.radius = WIDTH / 30;
    this.boostVel = WIDTH / 100;
    this.equilibriumVel = WIDTH / 100;
  }
  
  Ball.prototype.reset = function() {
    this.pos = new Vector2D(0, 0);
    this.vel = WIDTH / 200;
    this.theta = pi*(Math.random()/4 + 3/8);
  }
  
  Ball.prototype.updatePhysics = function() {
    this.updateCollisions();
    
    this.pos.shift(Vector2D.FromPolar(this.theta, this.vel));
    // Apply a drag force, until the ball reaches it's equilibrium speed.
    this.vel += 0.025 * (this.equilibriumVel - this.vel);
  };
  
  Ball.prototype.collision = function(surfaceAngle, object, depth) {
    if (surfaceAngle == 0) {
      surfaceAngle = 0.001;
    }
    this.theta += 2 * (Math.atan(1/Math.tan(surfaceAngle)) - this.theta);
    
    if (depth === undefined) {
      depth = 1;
    }
    if (object !== undefined && depth <= 3) {
      this.leaveObject(object, depth);
    }
  };
  
  Ball.prototype.leaveObject = function(object, depth) {
    // Get the ball to the edge of whatever object it's colliding with. Always do at least once (stillIn starts as true.)
    if (object.isRectangle) {
      this.pos.shift(Vector2D.FromPolar(this.theta, this.vel));
      var stillIn = this.rectangleCollision(object.pos, object.width, object.height, object.theta);
      if (stillIn["collision"]) {
        this.collision(stillIn["surfaceAngle"], object, depth + 1);
      }
    }
    else if (object.isCircle) {
      this.pos.shift(Vector2D.FromPolar(this.theta, this.vel));
      var stillIn = this.circleCollision(object.pos, object.radius);
      if (stillIn["collision"]) {
        this.collision(stillIn["surfaceAngle"], object, depth + 1);
      }
    }
  };
  
  Ball.prototype.rectangleCollision = function(pos, width, height, theta) {
    /*
      To check for the collision between the rotated rectangle and the circle, first the circle's origin point is "unrotated". Once the circle is unrotated, the closest point on the rectangle to the circle is found, and if the distance between that point and the circles origin is less than it's radius, then it's a collision!
     */
    var unrotatedX = Math.cos(theta) * (this.pos.x - pos.x) - Math.sin(theta) * (this.pos.y - pos.y) + pos.x;
    var unrotatedY = Math.sin(theta) * (this.pos.x - pos.x) + Math.cos(theta) * (this.pos.y - pos.y) + pos.y;

    var closestX, closestY;

    if (unrotatedX < pos.x - width/2 || unrotatedX > pos.x + width/2) {
      closestX = pos.x;
    }
    else {
      closestX = unrotatedX;
    }

    if (unrotatedY < pos.y - height/2 || unrotatedY > pos.y + height/2) {
      closestY = pos.y;
    }
    else {
      closestY = unrotatedY;
    }

    var distSquared = Math.pow(closestX - unrotatedX, 2) + Math.pow(closestY - unrotatedY, 2);
    var radiiSquared = Math.pow(this.radius, 2);

    if (distSquared <= radiiSquared) {
      if (unrotatedX + this.radius/2 > pos.x - width/2 && unrotatedX - this.radius/2 < pos.x - width/2 && Math.cos(this.theta) > 0) {
        // Left side collision.
        return {"collision": true, "surfaceAngle": theta};
      }
      else if (unrotatedX + this.radius/2 > pos.x + width/2 && unrotatedX - this.radius/2 < pos.x + width/2 && Math.cos(this.theta) < 0) {
        // Right side collision.
        return {"collision": true, "surfaceAngle": theta};
      }
      else if (unrotatedY + this.radius > pos.y - height/2 && unrotatedX - this.radius/2 < pos.y - height/2 && Math.sin(this.theta) > 0) {
        // Normal top collision.
        return {"collision": true, "surfaceAngle": theta + pi/2};
      }
      else {
        // Bottom collision.
        return {"collision": true, "surfaceAngle": theta + pi/2};
      }
    }
    else {
      // No collision.
      return {"collision": false, "surfaceAngle": 0}
    }
  };
  
  Ball.prototype.circleCollision = function(pos, radius) {
    var distSquared = Math.pow(this.pos.x - pos.x, 2) + Math.pow(this.pos.y - pos.y, 2);
    var radiiSquared = Math.pow(this.radius / 2 + radius / 2, 2);
    if (distSquared <= radiiSquared) {
      // The ball must be deflected off, as if on a surface tangent to the place where the ball hit on the circle of the propeller.
      var diffY = this.pos.y - pos.y;
      var diffX = this.pos.x - pos.x;
      // The perpendicular to any slope is it's negative reciprocal.
      var perpendicular = -diffX / diffY;
      var perpendicularAngle = Math.atan(perpendicular);
      return {"collision": true, "surfaceAngle": perpendicularAngle};
    }
    else {
      return {"collision": false, "surfaceAngle": 0};
    }
  };
  
  Ball.prototype.updateCollisions = function() {
    var x = this.pos.x;
    var y = this.pos.y;
    // Boundary collisions.
    if (x <= -HALFWIDTH + this.radius/2) {
      this.pos.x = -HALFWIDTH + this.radius/2;
      this.collision(pi);
    }
    if (x >= HALFWIDTH - this.radius/2) {
      this.pos.x = HALFWIDTH - this.radius/2;
      this.collision(pi);
    }
    if (y <= -HALFHEIGHT + this.radius/2) {
      this.pos.y = -HALFHEIGHT + this.radius/2;
      this.collision(pi/2);
    }
    if (y >= HALFHEIGHT + this.radius/2) {
      GC.lives -= 1;
      GC.setTimer();
      
      // TIMER CODE, IF WANTED
      
      this.reset();
    }
    // Plane collisions
    this.planeCollisions();
    // Bird collisions
    for (var i = 0; i < GC.birds.length; i++) {
      var bird = GC.birds[i];
      collision = this.circleCollision(bird.pos, bird.radius);
      if (collision["collision"]) {
        bird.hit();
        this.collision(collision["surfaceAngle"], bird);
      }
    }
  };
  
  Ball.prototype.planeCollisions = function() {
    // Propeller
    for (var i = 0; i < GC.plane.parts["propellers"].length; i++) {
      var propeller = GC.plane.parts["propellers"][i];
      
      var pos = GC.plane.pos.getShifted(propeller.pos.getRotated(-GC.plane.theta));
      var collision = this.circleCollision(pos, propeller.radius);
      if (collision["collision"]) {
        // Collision!
        // The propeller must impart a small velocity boost to the ball, when hit.
        this.vel += this.boostVel;
        this.collision(collision["surfaceAngle"], new Circle(pos, propeller.radius));
      }
    }
    
    // Body
    for (var i = 0; i < GC.plane.parts["rects"].length; i++) {
      var rectangle = GC.plane.parts["rects"][i];
      var theta = GC.plane.theta + rectangle.theta;
      // MADE CHANGE. IF PROBLEMATIC, THEN REMOVE. Take out the .getRotated(GC.plane.theta);
      var pos = GC.plane.pos.getShifted(rectangle.pos.getRotated(-GC.plane.theta));
      var collision = this.rectangleCollision(pos, rectangle.width, rectangle.height, theta);
      if (collision["collision"]) {
        var rect = new Rect(pos.x, pos.y, rectangle.width, rectangle.height, theta);
        
        this.collision(collision["surfaceAngle"], rect);
      }
    }
    for (var i = 0; i < GC.plane.parts["circles"].length; i++) {
      var circle = GC.plane.parts["circles"][i];
      
      var pos = GC.plane.pos.getShifted(circle.pos.getRotated(-GC.plane.theta));
      var collision = this.circleCollision(pos, circle.radius);
      if (collision["collision"]) {
        // Collision!
        this.collision(collision["surfaceAngle"], new Circle(pos, circle.radius));
      }
    }
  };
  
  Ball.prototype.display = function() {
    var life = GC.TOTALLIVES - GC.lives;
    fill(63 + life*(255-63)/GC.TOTALLIVES, 175 - life*175/GC.TOTALLIVES, 45 - life*45/GC.TOTALLIVES);
    ellipse(this.pos.x, this.pos.y, this.radius/2, this.radius/2);
  }
  
  return Ball;
}());

var Bird = (function() {
  
  function Bird(pos) {
    this.pos = pos;
    this.anchorPos = pos;
    this.destination = pos;
    this.radius = WIDTH / 25;
    this.isCircle = true;
    
    this.falling = false;
    this.fallingVel = 0;
    // Affecting the propeller is only a once per bird action.
    this.canAffectPropeller = true;
    
    // Determines how often coins are dropped and, if they are, how many.
    // 0.1 = 10% chance for a bird to drop coins.
    this.coinChance = 0.1;
    // Base coins are automatically always dropped. Then there's a 50% chance for every next coin to be dropped. For example, for 5 coins to be dropped, you have 2 automatically, then 3 by luck. Each is 50% = 0.5, and 0.5*0.5*0.5 = 0.125, or 1/8 chance.
    this.baseCoins = 2;
    this.nextChance = 0.5;
    
    this.wiggleNumber = 10000 * (Math.random()*2 - 1);
    this.flyInNumbers = [pi*(Math.random()*2 - 1), pi*(Math.random()*2 - 1), (Math.random() + 1) / 2 - 0.25, Math.floor(Math.random() * 2)*2 - 1];
  }
  
  Bird.prototype.hit = function() {
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
  };
  
  Bird.prototype.fall = function() {
    if (this.falling) {
      this.fallingVel += GRAVITY;
      this.pos.y += this.fallingVel;
      
      // Check if the bird has gotten stuck in the plane's propeller.
      this.inPropeller();
      
      // Check if the bird has fallen out of the screen.
      if (this.pos.y > HALFHEIGHT) {
        GC.birds.splice(GC.birds.indexOf(this), 1);
      }
    }
  };
  
  Bird.prototype.inPropeller = function() {
    if (this.canAffectPropeller) {
      for (var i = 0; i < GC.plane.parts["propellers"].length; i++) {
        var propeller = GC.plane.parts["propellers"][i];

        var distSquared = Math.pow(this.pos.x - GC.plane.pos.getShifted(propeller.pos).x, 2) + Math.pow(this.pos.y - GC.plane.pos.getShifted(propeller.pos).y, 2);
        var radiiSquared = Math.pow(this.radius/2 + propeller.radius/2, 2);
        if (distSquared <= radiiSquared) {
          this.canAffectPropeller = false;
          // The plane's engine reliability must be reduced.
          GC.plane.engineReliability = 4*Math.random() - 1;
        }
      }
    }
  };
  
  Bird.prototype.wiggle = function() {
    // Wiggle around, now, if it's not falling.
    if (this.falling == false) {
      this.pos = this.anchorPos.getShifted(new Vector2D(Math.cos((millis() + this.wiggleNumber) / (100*pi)), 1/2 * Math.sin((millis() + this.wiggleNumber) / (50*pi))).getScaled(this.radius / 5));
    }
  };
  
  Bird.prototype.display = function() {
    fill(100, 100, 100);
    ellipse(this.pos.x, this.pos.y, this.radius/2, this.radius/2);
    
    if (this.falling) {
      // Draw little "x"s over the eye regions to signify that the bird is falling/dead.
      var xSize = this.radius / 4;
      stroke(255, 255, 255);
      strokeWeight(xSize/2);
      // Left eye
      line(this.pos.x - 3/2 * xSize, this.pos.y - xSize/2, this.pos.x - xSize/2, this.pos.y + xSize/2);
      line(this.pos.x - 3/2 * xSize, this.pos.y + xSize/2, this.pos.x - xSize/2, this.pos.y - xSize/2);
      // Right eye
      line(this.pos.x + 1/2 * xSize, this.pos.y - xSize/2, this.pos.x + 3/2 * xSize, this.pos.y + xSize/2);
      line(this.pos.x + 1/2 * xSize, this.pos.y + xSize/2, this.pos.x + 3/2 * xSize, this.pos.y - xSize/2);
    }
  };
  
  return Bird;
}());
var BirdKing = (function() {
  
  function BirdKing(pos) {
    // Inherit the base methods of the bird object.
    Bird.call(this, pos);
    
    this.radius *= 3;
    this.lives = 5;
    
    // How many bird minions he summons per hit.
    this.power = 8;
    // Controls the Bird King's bird rain.
    this.birdRain = false;
    // Lightning occurs whenever the Bird King is struck with a ball.
    this.lightning = 0;
  }
  
  BirdKing.prototype = Object.create(Bird.prototype);
  
  BirdKing.prototype.hit = function() {
    if (this.birdRain == false) {
      this.lives -= 1;

      // Summon minions
      for (var i = 0; i < this.power; i++) {
        var angle = 2*pi * Math.random();
        var radius = 3/2 * this.radius;
        var bird = new BirdMinion(this.pos.getShifted(Vector2D.FromPolar(angle, radius)), this, radius, angle);
        GC.birds.push(bird);
      }
    }
    
    if (this.lives <= 0) {
      this.falling = true;
    }
    
    this.birdRain = true;
    this.lightning = 1;
  };
  
  BirdKing.prototype.display = function() {
    fill(100, 100, 100);
    ellipse(this.pos.x, this.pos.y, this.radius/2, this.radius/2);
    
    var xSize = this.radius / 4;
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
  };
  
  BirdKing.prototype.displayLightning = function() {
    if (this.lightning > 0) {
      this.lightning -= (millis() - GC.prevTime) / 1000;
    }
    
    fill(255, 255, 255, Math.pow(this.lightning, 3));
    rect(0, 0, WIDTH, HEIGHT);
  };
  
  return BirdKing;
}());
var BirdMinion = (function() {
  
  function BirdMinion(pos, master, circlingRadius, angle) {
    // Inherit the base methods of the bird object.
    Bird.call(this, pos);
    
    // Circle the master to protect them.
    this.master = master;
    // The radius at which to circle at.
    this.circlingRadius = circlingRadius;
    this.angle = angle;
    
    this.deathMode = false;
    this.sickly = 0;
  }
  
  BirdMinion.prototype = Object.create(Bird.prototype);
  
  BirdMinion.prototype.wiggle = function() {
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
      this.pos = this.anchorPos.getShifted(new Vector2D(Math.cos((millis() + this.wiggleNumber) / (100*pi)), 1/2 * Math.sin((millis() + this.wiggleNumber) / (50*pi))).getScaled(this.radius / 5));
    }
  };
  
  BirdMinion.prototype.display = function() {
    fill(100 - this.sickly, 100 + this.sickly, 100 - this.sickly);
    ellipse(this.pos.x, this.pos.y, this.radius/2, this.radius/2);
    
    var xSize = this.radius / 4;
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
  };
  
  return BirdMinion;
}());

var Coin = (function() {
  
  function Coin(pos, vel) {
    this.pos = pos;
    this.vel = vel;
    
    this.radius = WIDTH / 50;
    
    this.theta = 0;
    this.omega = (2*Math.random() - 1)/4;
  }
  
  Coin.prototype.updatePhysics = function() {
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
  };
  
  Coin.prototype.display = function() {
    ctx.save();
    
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.theta);
    
    fill(210, 210, 25);
    ellipse(0, 0, this.radius, this.radius);
    
    fill(0, 0, 0);
    textSize(3/2*this.radius);
    text("$", 0, this.radius/2);
    
    ctx.restore();
  };
  
  return Coin;
}());

var Player = (function() {
  
  function Player() {
    this.coins = 0;
    this.planes = [];
    
    // Whenever above 0, display how many coins are owned.
    this.coinDisplay = 0;
  }
  
  Player.prototype.displayCoins = function() {
    this.coinDisplay -= 1;
    
    var transparency = 1 - Math.pow(1 - this.coinDisplay/fps/3, 9);
    
    ctx.save();
    
    ctx.translate(-3/4 * HALFWIDTH, 7/8 * HALFHEIGHT);
    
    fill(120, 75, 0, transparency);
    rect(0, 0, HALFWIDTH / 3, HALFHEIGHT / 15);
    
    fill(220, 220, 220, transparency);
    textSize(HALFWIDTH / 15);
    text(this.coins, HALFWIDTH / 30, HALFHEIGHT / 45);
    
    fill(210, 210, 25, transparency);
    ellipse(-HALFWIDTH / 8, 0, HALFWIDTH / 45, HALFHEIGHT / 45);
    fill(0, 0, 0, transparency);
    textSize(HALFWIDTH / 25);
    text("$", -HALFWIDTH / 8, HALFHEIGHT / 70);
    
    ctx.restore();
  };
  
  return Player;
}());

var Button = (function() {
  
  function Button(x, y, width, height, label, labelSize, onClick, data) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.label = label;
    this.labelSize = labelSize;
    this.onClick = onClick;
    this.data = data;
    
    this.onMouseOver = function() {};
  }
  
  Button.prototype.clicked = function() {
    var mouseX = InputFlags["mousepos"]["x"];
    var mouseY = InputFlags["mousepos"]["y"];
    if (mouseX > this.x - this.width/2 && mouseX < this.x + this.width/2 && mouseY > this.y - this.height/2 && mouseY < this.y + this.height/2) {
      // Mouse is within the button. Is it clicking?
      if (InputFlags["click"]) {
        this.onClick();
        return true;
      }
    }
    return false;
  };
  
  Button.prototype.display = function() {
    var mouseOver = false;
    
    fill(200, 200, 200);
    var mouseX = InputFlags["mousepos"]["x"];
    var mouseY = InputFlags["mousepos"]["y"];
    if (mouseX > this.x - this.width/2 && mouseX < this.x + this.width/2 && mouseY > this.y - this.height/2 && mouseY < this.y + this.height/2) {
      fill(160, 160, 160);
      mouseOver = true;
    }
    rect(this.x, this.y, this.width, this.height);
    
    textSize(this.labelSize);
    fill(0, 0, 0);
    text(this.label, this.x, this.y + this.labelSize / 3);
    
    if (mouseOver) {
      this.onMouseOver();
    }
  };
  
  return Button;
}());


var GameController = (function() {
  
  function GameController() {
    this.plane = new Plane({
      "propellers": [
        new Propeller(new Vector2D(0, 0), HEIGHT / 10)
      ],
      "rects": [
        new Rect(0, 0, 5/16 * WIDTH, HEIGHT / 30, 0)
      ],
      "circles": [
      ]
    });
    
    this.ball = new Ball();
    this.birds = [];
    this.birdsFlight = true;
    this.initBirds();
    
    this.coins = [];
    this.player = new Player();
    
    this.TOTALLIVES = 2;
    this.lives = 2;
    
    this.screen = "menu";
    this.level = "default";
    this.paused = false;
    // Don't allow more than one button press per frame.
    this.hitButton = false;
    this.buttons = {
      "menu": [
          new Button(0, -HALFHEIGHT / 5, HALFWIDTH / 2, HALFHEIGHT / 6, "PLAY", HALFHEIGHT / 7, function() {
            GC.screen = "levels";
          }),
          new Button(0, 0, HALFWIDTH / 2, HALFHEIGHT / 6, "SHOP", HALFHEIGHT / 7, function() {
            GC.screen = "shop";
          })
      ],
      "levels": [
        new Button(4/5 * HALFWIDTH, 15/16 * HALFHEIGHT, WIDTH / 6, HEIGHT / 24, "BACK", HALFHEIGHT / 16, function() {
            GC.screen = "menu";
          }),
        new Button(-HALFWIDTH / 2, -HALFHEIGHT / 5, 51/64 * HALFWIDTH, HALFHEIGHT / 5, "NORMAL", 11/72 * HALFHEIGHT, function() {
            GC.screen = "game";
            GC.level = "default";
            GC.initLevel();
          }),
        new Button(HALFWIDTH / 2, -HALFHEIGHT / 5, 51/64 * HALFWIDTH, HALFHEIGHT / 5, "ENDLESS", 11/72 * HALFHEIGHT, function() {
            GC.screen = "game";
            GC.level = "endless";
            GC.initLevel();
          }),
        new Button(-HALFWIDTH / 2, HALFHEIGHT / 16, 51/64 * HALFWIDTH, HALFHEIGHT / 5, "BIRD KING", 11/72 * HALFHEIGHT, function() {
            GC.screen = "game";
            GC.level = "bird king";
            GC.initLevel();
          })
      ],
      "game": [
        new Button(4/5 * HALFWIDTH, 15/16 * HALFHEIGHT, WIDTH / 6, HEIGHT / 24, "PAUSE", HALFHEIGHT / 16, function() {
            GC.paused = true;
        }),
      ],
      "paused": [
          new Button(0, -2/32 * HALFHEIGHT, WIDTH / 3, HEIGHT / 13, "RESUME", HALFHEIGHT / 8, function() {
            GC.paused = false;
          }),
          new Button(0, 4 * HALFHEIGHT / 32, WIDTH / 3, HEIGHT / 13, "MENU", HALFHEIGHT / 8, function() {
            GC.paused = false;
            GC.screen = "menu";
          }),
          new Button(0, 10 * HALFHEIGHT / 32, WIDTH / 3, HEIGHT / 13, "RESTART", HALFHEIGHT / 8, function() {
            GC.paused = false;
            GC.initLevel();
          })
      ],
      "gameover": [
          new Button(0, HALFHEIGHT / 4, WIDTH / 3, HEIGHT / 12, "RESTART", HALFHEIGHT / 8, function() {
            GC.screen = "game";
            GC.initLevel();
          }),
          new Button(0, 15 * HALFHEIGHT / 32, WIDTH / 3, HEIGHT / 12, "MENU", HALFHEIGHT / 8, function() {
            GC.screen = "menu";
          })
      ],
      "shop": [
        new Button(4/5 * HALFWIDTH, 15/16 * HALFHEIGHT, WIDTH / 6, HEIGHT / 24, "BACK", HALFHEIGHT / 16, function() {
            GC.screen = "menu";
          })
      ],
      "shopScroll": [],
      "shopItems": []
    };
    
    this.shopShelves = [
      {
        "name": "WINGS",
        "scroll": 0,
        "items": [
          {
            "cost": 10,
            "action": function() {
              if (GC.player.coins >= 10) {
                GC.player.coins -= 10;
                GC.plane.parts["rects"] = [
                  new Rect(0, 0, 5/16 * WIDTH, HEIGHT / 30, 0)
                ];
                
                GC.plane.turnSpeed = 0.004;
                GC.plane.baseReliability = 0.25 * 1.5;
                GC.plane.engineRecovery = 0.1;
              }
            },
            "name": "1",
            "description": "Using one wing provides the default values of engine recovery against birds and agility."
          },
          {
            "cost": 45,
            "action": function() {
              if (GC.player.coins >= 45) {
                GC.player.coins -= 45;
                GC.plane.parts["rects"] = [
                  new Rect(WIDTH / 10, 0, WIDTH / 60, 1/16 * HEIGHT, 0, [100, 70, 20]),
                  new Rect(-WIDTH / 10, 0, WIDTH / 60, 1/16 * HEIGHT, 0, [100, 70, 20]),
                  new Rect(0, HEIGHT / 50, 5/16 * WIDTH, HEIGHT / 40, 0),
                  new Rect(0, -HEIGHT / 50, 5/16 * WIDTH, HEIGHT / 40, 0)
                ];
                
                GC.plane.turnSpeed = 0.004 * 0.85;
                GC.plane.baseReliability = 0.25 * 1.25;
                GC.plane.engineRecovery = 0.1 * 1.25;
              }
            },
            "name": "2",
            "description": "Using two wings provides a 25% increase in engine recovery against birds, but a 15% decrease in agility."
          },
          {
            "cost": 55,
            "action": function() {
              if (GC.player.coins >= 55) {
                GC.player.coins -= 55;
                GC.plane.parts["rects"] = [
                  new Rect(WIDTH / 10, 0, WIDTH / 60, 1/16 * HEIGHT, 0, [100, 70, 20]),
                  new Rect(-WIDTH / 10, 0, WIDTH / 60, 1/16 * HEIGHT, 0, [100, 70, 20]),
                  new Rect(0, HEIGHT / 25, 5/16 * WIDTH, HEIGHT / 40, 0),
                  new Rect(0, -HEIGHT / 25, 5/16 * WIDTH, HEIGHT / 40, 0),
                  new Rect(0, 0, 5/16 * WIDTH, HEIGHT / 40, 0)
                ];
                
                GC.plane.turnSpeed = 0.004 * 0.7;
                GC.plane.baseReliability = 0.25 * 1.5;
                GC.plane.engineRecovery = 0.1 * 1.5;
              }
            },
            "name": "3",
            "description": "Using three wings provides a 50% increase in engine recovery against birds, but a 30% decrease in agility."
          },
          {
            "cost": 65,
            "action": function() {
              if (GC.player.coins >= 65) {
                GC.player.coins -= 65;
                GC.plane.parts["rects"] = [
                  new Rect(0, 0, 5/16 * WIDTH, HEIGHT / 24, 0),
                  new Rect(-5/32 * WIDTH, 0, WIDTH / 30, HEIGHT / 12, 0),
                  new Rect(5/32 * WIDTH, 0, WIDTH / 30, HEIGHT / 12, 0),
                  new Rect(-9/64 * WIDTH, -1/17 * HEIGHT, WIDTH / 30, HEIGHT / 16, -pi/5),
                  new Rect(9/64 * WIDTH, -1/17 * HEIGHT, WIDTH / 30, HEIGHT / 16, pi/5),
                  new Rect(-9/64 * WIDTH, 1/17 * HEIGHT, WIDTH / 30, HEIGHT / 16, pi/5),
                  new Rect(9/64 * WIDTH, 1/17 * HEIGHT, WIDTH / 30, HEIGHT / 16, -pi/5)
                ];
                
                GC.plane.turnSpeed = 0.004 * 1.5;
              }
            },
            "name": "TIE",
            "description": "Using the TIE fighter configuration provides incredible agility (150%) at the cost of a clumsy surface."
          }
        ]
      },
      {
        "name": "PROPELLERS",
        "scroll": 0,
        "items": [
          {
            "cost": 15,
            "action": function() {
              if (GC.player.coins >= 15) {
                GC.player.coins -= 15;
                GC.plane.parts["propellers"] = [
                  new Propeller(new Vector2D(0, 0), HEIGHT / 10)
                ];
                
                GC.plane.speed = WIDTH / 50;
              }
            },
            "name": "1",
            "description": "Using one propeller provides the default plane speed."
          },
          {
            "cost": 45,
            "action": function() {
              if (GC.player.coins >= 45) {
                GC.player.coins -= 45;
                GC.plane.parts["propellers"] = [
                  new Propeller(new Vector2D(WIDTH / 12, 0), HEIGHT / 10),
                  new Propeller(new Vector2D(-WIDTH / 12, 0), HEIGHT / 10)
                ];
                
                GC.plane.speed = WIDTH / 50 * 1.1;
              }
            },
            "name": "2",
            "description": "Using two propellers provides a 10% increase in plane speed."
          },
          {
            "cost": 75,
            "action": function() {
              if (GC.player.coins >= 75) {
                GC.player.coins -= 75;
                GC.plane.parts["propellers"] = [
                  new Propeller(new Vector2D(WIDTH / 31, 0), HEIGHT / 16),
                  new Propeller(new Vector2D(-WIDTH / 31, 0), HEIGHT / 16),
                  new Propeller(new Vector2D(WIDTH / 10, 0), HEIGHT / 16),
                  new Propeller(new Vector2D(-WIDTH / 10, 0), HEIGHT / 16)
                ];
                
                GC.plane.speed = WIDTH / 50 * 1.2;
              }
            },
            "name": "4",
            "description": "Using four propellers provides a 20% increase in plane speed."
          }
        ]
      }
    ];
    
    // Set the left and right scroll buttons for the shop's shelves.
    this.scrollSpeed = WIDTH / 4;
    for (var i = 0; i < this.shopShelves.length; i++) {
      this.buttons["shopItems"].push([]);
      for (var j = 0; j < this.shopShelves[i]["items"].length; j++) {
        // Item buttons
        var item = this.shopShelves[i]["items"][j];
        
        this.buttons["shopItems"][i].push(new Button(1/4 * j * WIDTH + WIDTH / 16, 2/7 * i * HALFHEIGHT - 16/71 * HALFHEIGHT, 7/16 * HALFWIDTH, HALFHEIGHT / 6, item.name, HALFWIDTH / 6, item.action, {"cost": item.cost, "description": item.description}));
        this.buttons["shopItems"][i][this.buttons["shopItems"][i].length - 1].onMouseOver = function() {
          if (this.x < -1/12 * WIDTH) {
            return 0;
          }
          // Show the pricetag.
          fill(160, 160, 160);
          rect(this.x, this.y, this.width, this.height);
          
          textSize(13/16 * this.labelSize);
          fill(0, 0, 0);
          text(this.data.cost, this.x + 7/16 * this.width, this.y + this.labelSize / 4, "right");
          
          fill(210, 210, 25);
          ellipse(this.x - HALFWIDTH / 7, this.y, HALFWIDTH / 16, HALFHEIGHT / 16);
          fill(0, 0, 0);
          textSize(3/4 * this.labelSize);
          text("$", this.x - HALFWIDTH / 7, this.y + this.labelSize / 4);
          
          // Show the description.
          fill(5, 20, 60, 0.8);
          rect(this.x, this.y - 21/10 * this.height, this.width, 3 * this.height);
          
          fill(160, 170, 200);
          textWrap(this.data.description, this.x, this.y - 18/5 * this.height, this.width, this.width / 8);
        };
      }
      
      // Scroll buttons
      this.buttons["shopScroll"].push(new Button(-WIDTH / 4 + HALFWIDTH / 10, 2/7 * i * HALFHEIGHT - 14/71 * HALFHEIGHT, WIDTH / 12, HEIGHT / 24, ">", HALFHEIGHT / 12, function() {
        GC.shopShelves[this.data]["scroll"] -= GC.scrollSpeed;
        for (var i = 0; i < GC.buttons["shopItems"][this.data].length; i++) {
          var item = GC.buttons["shopItems"][this.data][i];

          item.x -= GC.scrollSpeed;
        }
      }, i));
      this.buttons["shopScroll"].push(new Button(-WIDTH / 4 - HALFWIDTH / 10, 2/7 * i * HALFHEIGHT - 14/71 * HALFHEIGHT, WIDTH / 12, HEIGHT / 24, "<", HALFHEIGHT / 12, function(i) {
        if (GC.shopShelves[this.data]["scroll"] < 0) {
          GC.shopShelves[this.data]["scroll"] += GC.scrollSpeed;
          for (var i = 0; i < GC.buttons["shopItems"][this.data].length; i++) {
            var item = GC.buttons["shopItems"][this.data][i];

            item.x += GC.scrollSpeed;
          }
        }
      }, i));
    }
    
    this.levelSegment = 0;
    this.levels = {
      "default": function() {
        GC.screen = "gameover";
        // Reward the player with 5 coins for the succesfully completed level.
        for (var i = 0; i < 5; i++) {
          var angle = pi*(1 + Math.random());
          GC.coins.push(new Coin(new Vector2D(0, 0), Vector2D.FromPolar(angle, HALFWIDTH / 150)));
        }
      },
      "bird king": function() {
        GC.screen = "gameover";
        // Reward the player with 10 coins for the succesfully completed level.
        for (var i = 0; i < 10; i++) {
          var angle = pi*(1 + Math.random());
          GC.coins.push(new Coin(new Vector2D(0, 0), Vector2D.FromPolar(angle, HALFWIDTH / 150)));
        }
      },
      "endless": function() {
        GC.levelSegment += 1;
        GC.setTimer();
        GC.ball.reset();
        GC.initBirds();
        
        // Reward the player with 2*levelSegment + 1 coins
        for (var i = 0; i < (2*GC.levelSegment + 1); i++) {
          var angle = pi*(1 + Math.random());
          GC.coins.push(new Coin(new Vector2D(0, 0), Vector2D.FromPolar(angle, HALFWIDTH / 150)));
        }
      }
    };
    
    // Set to 3 whenever the player loses a life. It gives the player a few seconds to recover.
    this.prevTime = Date.now() - start;
    this.lossStart = 0;
  }
  
  GameController.prototype.callButtons = function(buttons) {
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.display();
      if (this.hitButton == false) {
        if (button.clicked()) {
          this.hitButton = true;
        }
      }
    }
  };
  GameController.prototype.callButtonsDisplay = function(buttons) {
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.display();
    }
  };
  GameController.prototype.callButtonsClicked = function(buttons) {
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      if (this.hitButton == false) {
        if (button.clicked()) {
          this.hitButton = true;
        }
      }
    }
  };
  
  GameController.prototype.update = function() {
    this.callButtons(this.buttons[this.screen]);
    
    if (this.screen == "menu") {
      this.menuScreen();
    }
    else if (this.screen == "levels") {
      this.levelsScreen();
    }
    else if (this.screen == "game") {
      this.gameScreen();
    }
    else if (this.screen == "gameover") {
      this.gameoverScreen();
    }
    else if (this.screen == "shop") {
      this.shopScreen();
    }
    
    this.hitButton = false;
  };
  
  GameController.prototype.gameScreen = function() { 
    if (this.paused) {
      this.updateDisplay();
      
      fill(5, 20, 60, 0.8);
      rect(0, 0, 7/8 * HALFWIDTH, 9/10 * HALFHEIGHT);
      
      fill(160, 170, 200);
      textSize(HALFWIDTH / 6);
      text("PAUSED", 0, -HALFHEIGHT / 4);
      
      this.callButtons(this.buttons["paused"]);
    }
    else {
      if (this.lossTimer > 0 && this.birdsFlight) {
        // Make birds fly in.
        for (var i = 0; i < this.birds.length; i++) {
          var bird = this.birds[i];
          var m = this.lossTimer/3;

          bird.anchorPos = bird.destination.getShifted(new Vector2D(bird.flyInNumbers[3]*Math.cos(bird.flyInNumbers[0]*m), Math.sin(bird.flyInNumbers[1]*m)).getScaled(m*bird.flyInNumbers[2]).getScaled(HALFWIDTH));
        }
      }
      else {
        this.birdsFlight = false;
      }
      
      this.updatePhysics();
      this.updateDisplay();
      this.updateCoins();
      
      if (this.lives == -1 || this.birds.length <= 0) {
        if (this.birds.length <= 0) {
          this.levels[this.level]();
        }
        else {
          this.screen = "gameover";
        }
        return 0;
      }

      if (this.lossTimer > 0) {
        this.lossTimer -= (millis() - this.prevTime) / 1000;

        if (this.birdsFlight == false) {
          // Birds only fly in on the first timer so it's ideal for checking whether or not to display the red tinge.
          fill(255, 0, 0, Math.pow(this.lossTimer/3, 3));
          rect(0, 0, WIDTH, HEIGHT);
        }

        fill(0, 0, 0);
        textSize(HALFWIDTH);
        var time = Math.ceil(this.lossTimer);
        if (time == 0) {
          time = 1;
        }
        text(time, 0, -HALFHEIGHT / 6);
      }
    }
  };
  
  GameController.prototype.menuScreen = function() {
    this.plane.updatePhysics();
    this.plane.display();
    
    fill(0, 0, 0);
    textSize(HALFWIDTH / 4);
    text("Bird Breaker", 0, -HALFHEIGHT / 2);
  };
  
  GameController.prototype.levelsScreen = function() {
    this.plane.updatePhysics();
    this.plane.display();
    
    fill(0, 0, 0);
    textSize(HALFWIDTH / 4);
    text("Levels", 0, -HALFHEIGHT / 2);
  };
  
  GameController.prototype.gameoverScreen = function() {
    fill(0, 0, 0);
    textSize(Math.sin(millis()/500)*HALFWIDTH/20 + HALFWIDTH/4);
    
    ctx.save();

    ctx.rotate(Math.sin(millis()/250) / 10);
    if (this.lives == -1) {
      text("GAME OVER", 0, 0);
    }
    else {
      text("YOU WON", 0, 0);
    }
    
    ctx.restore();
    
    this.updateCoins();
  };
  
  GameController.prototype.shopScreen = function() {
    this.plane.updatePhysics();
    this.plane.display();
    
    // Shop sign
    fill(90, 60, 20);
    rect(0, -3/4 * HALFHEIGHT, HALFWIDTH, HALFHEIGHT / 2);
    fill(20, 20, 20);
    ellipse(2/5 * HALFWIDTH, -3/4 * HALFHEIGHT + HALFHEIGHT / 5, HALFWIDTH / 55, HALFWIDTH / 55);
    fill(15, 15, 15);
    ellipse(-2/5 * HALFWIDTH, -3/4 * HALFHEIGHT + HALFHEIGHT / 5, HALFWIDTH / 55, HALFWIDTH / 50);
    fill(25, 25, 25);
    ellipse(2/5 * HALFWIDTH, -3/4 * HALFHEIGHT - HALFHEIGHT / 5, HALFWIDTH / 55, HALFWIDTH / 55);
    fill(20, 20, 20);
    ellipse(-2/5 * HALFWIDTH, -3/4 * HALFHEIGHT - HALFHEIGHT / 5, HALFWIDTH / 50, HALFWIDTH / 50);
    
    fill(0, 0, 0);
    textSize(HALFWIDTH / 4);
    text("SHOP", 0, -7/10 * HALFHEIGHT);
    
    fill(60, 30, 10, 0.5);
    rect(HALFWIDTH / 16, -187/320 * HALFHEIGHT, 4/9 * HALFWIDTH, HALFHEIGHT / 12);
    
    fill(0, 0, 0);
    textSize(HALFWIDTH / 10);
    text(this.player.coins, 9/32 * HALFWIDTH, -11/20 * HALFHEIGHT, "right");
    
    fill(210, 210, 25);
    ellipse(-HALFWIDTH / 4, -187/320 * HALFHEIGHT, HALFWIDTH / 16, HALFHEIGHT / 16);
    textSize(HALFWIDTH / 8);
    fill(0, 0, 0);
    text("$", -HALFWIDTH / 4, -87/160 * HALFHEIGHT);
    
    // Split up the display and click checking for the scroll buttons to give them "priority" over the item buttons. Click must be called first so that they are checked before the shopItems buttons, and display must be called after, so that they are drawn over the shopItems buttons.
    this.callButtonsClicked(this.buttons["shopScroll"]);
    // Shop shelves
    for (var i = 0; i < this.shopShelves.length; i++) {
      var shelf = this.shopShelves[i];
      
      // Shelves
      fill(110, 115, 120);
      rect(WIDTH / 40, 2/7 * i * HALFHEIGHT - HALFHEIGHT / 4, 19/20 * WIDTH, HALFHEIGHT / 4);
      
      this.callButtons(this.buttons["shopItems"][i]);
      
      fill(150, 200, 255);
      rect(-WIDTH / 2, 2/7 * i * HALFHEIGHT - HALFHEIGHT / 4, WIDTH / 10, HALFHEIGHT / 4);
      fill(110, 115, 120);
      rect(-WIDTH / 4, 2/7 * i * HALFHEIGHT - HALFHEIGHT / 4, 8/20 * WIDTH, HALFHEIGHT / 4);
      
      fill(100, 105, 110);
      rect(WIDTH / 40, 2/7 * i * HALFHEIGHT - HALFHEIGHT / 4 + HALFHEIGHT / 7, 19/20 * WIDTH, HALFHEIGHT / 24);
      // Shelf name
      fill(175, 175, 175);
      rect(-WIDTH / 4, 2/7 * i * HALFHEIGHT - 22/71 * HALFHEIGHT, WIDTH / 3, HALFHEIGHT / 10);
      fill(0, 0, 0);
      textSize(HALFWIDTH / 12);
      text(shelf["name"], -WIDTH / 4, 2/7 * i * HALFHEIGHT - 20/71 * HALFHEIGHT);
    }
    this.callButtonsDisplay(this.buttons["shopScroll"]);
  };
  
  GameController.prototype.updatePhysics = function() {
    // Plane
    this.plane.updatePhysics();
    // Ball
    if (this.lossTimer <= 0) {
      this.ball.updatePhysics();
    }
    // Birds
    for (var i = 0; i < this.birds.length; i++) {
      var bird = this.birds[i];
      bird.fall();
      bird.wiggle();
    }
  };
  GameController.prototype.updateDisplay = function() {
    // Plane
    this.plane.display();
    // Ball
    this.ball.display();
    // Birds
    for (var i = 0; i < this.birds.length; i++) {
      var bird = this.birds[i];
      bird.display();
    }
  };
  
  GameController.prototype.updateCoins = function() {
    for (var i = 0; i < this.coins.length; i++) {
      var coin = this.coins[i];
      coin.display();
      coin.updatePhysics();
    }
    
    if (this.player.coinDisplay > 0) {
      this.player.displayCoins();
    }
  }
  
  GameController.prototype.setTimer = function() {
    this.lossTimer = 3;
  };
  
  GameController.prototype.initLevel = function() {
    this.levelSegment = 0;
    this.setTimer();
    this.lives = this.TOTALLIVES;
    this.ball.reset();
    this.initBirds();
  };
  
  GameController.prototype.initBirds = function() {
    this.birds = [];
    this.birdsFlight = true;
    
    if (this.level == "default" || this.level == "endless") {
      this.initBirdsDefault();
    }
    else if (this.level == "bird king") {
      this.initBirdsBirdKing();
    }
  };
  GameController.prototype.initBirdsDefault = function() {
    var rows = 5;
    for (var row = 1; row < rows; row++) {
      for (var col = -row; col < row + 1; col++) {
        this.birds.push(new Bird(new Vector2D((col+(Math.random()*2-1)/(row+1)) * WIDTH / (3*row), -(row + rows-4) * HALFHEIGHT / (rows+1))));
      }
    }
  };
  GameController.prototype.initBirdsBirdKing = function() {
    this.birds.push(new BirdKing(new Vector2D(0, -2/3 * HALFHEIGHT)));
  };
  
  return GameController;
}());

// New context fuctions here.
function fill(red, green, blue, alpha) {
  if (alpha === undefined) {
    alpha = 1;
  }
  ctx.fillStyle = "rgba("+Math.floor(red)+","+Math.floor(green)+","+Math.floor(blue)+","+alpha+")";
}
function stroke(red, green, blue) {
  ctx.strokeStyle = "rgb("+Math.floor(red)+","+Math.floor(green)+","+Math.floor(blue)+")";
}
function strokeWeight(weight) {
  ctx.lineWidth = weight;
}
function rect(x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x - width/2, y - height/2, width, height);
  ctx.closePath();
  ctx.fill();
}
function ellipse(x, y, xRadius, yRadius) {
  ctx.beginPath();
  ctx.ellipse(x, y, xRadius, yRadius, 0, 0, 2*pi);
  ctx.closePath();
  ctx.fill();
}
function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();
}
function textSize(size) {
  ctx.font = size + "px Arial";
}
function text(str, x, y, alignment) {
  if (alignment === undefined) {
    alignment = "center";
  }
  ctx.textAlign = alignment;
  ctx.fillText(str, x, y);
}
function textWrap(str, x, y, width, fontSize) {
  // Idea adapted from https://codepen.io/ashblue/pen/fGkma?editors=0010
  
  var lines = [],
      line = "",
      lineTest = "",
      words = str.split(" "),
      currentY = y;
  
  textSize(fontSize);
  
  for (var i = 0, len = words.length; i < len; i++) {
    lineTest = line + words[i] + " ";
    
    if (ctx.measureText(lineTest).width < width) {
      line = lineTest;
    }
    else {
      currentY += fontSize;
      
      lines.push({"text": line, "currentY": currentY});
      line = words[i] + " ";
    }
  }
  
  // Catch last line in-case something is left over
  if (line.length > 0) {
    currentY += fontSize;
    lines.push({ "text": line.trim(), "currentY": currentY });
  }
  
  for (var i = 0, len = lines.length; i < len; i++) {
    text(lines[i]["text"], x, lines[i]["currentY"]);
  }
}

function millis() {
  return Date.now() - start;
}

function resize() {
  ctx.translate(-HALFWIDTH, -HALFHEIGHT);
  
  canvas.width = 4/5 * window.innerWidth;
  canvas.height = canvas.width;
  if (canvas.height > 7/8 * window.innerHeight) {
    // If the height is greater than the height of the screen, set it accordingly.
    canvas.height = 7/8 * window.innerHeight;
    canvas.width = canvas.height;
  }
  
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  HALFWIDTH = WIDTH / 2;
  HALFHEIGHT = HEIGHT / 2;
  
  ctx.translate(HALFWIDTH, HALFHEIGHT);
}

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  
  WIDTH = 4/5 * window.innerWidth;
  HEIGHT = WIDTH;
  HALFWIDTH = WIDTH / 2;
  HALFHEIGHT = HEIGHT / 2;
  
  ctx.translate(HALFWIDTH + 0.5, HALFHEIGHT + 0.5);
  
  GRAVITY = Math.sqrt(HEIGHT) / 245;
  
  fps = 0;
  start = Date.now();
  
  var body = document.getElementsByTagName("body")[0];
  body.onresize = resize;
  resize();
  
  window.onkeydown = function(e) {
    if (InputFlags[e.keyCode] !== undefined) {
      InputFlags[e.keyCode] = true;
    }
  };
  window.onkeyup = function(e) {
    if (InputFlags[e.keyCode] !== undefined) {
      InputFlags[e.keyCode] = false;
    }
  };
  canvas.onmouseup = function(e) {
    InputFlags["click"] = true;
  };
  document.onmousemove = function(e) {
    var x = e.clientX - window.innerWidth/2;
    
    var y = e.clientY - HALFHEIGHT - 8;
    InputFlags["mousepos"]["x"] = x;
    InputFlags["mousepos"]["y"] = y;
  };
  
  GC = new GameController();
  
  window.requestAnimationFrame(loop);
}

function loop() {
  fill(150, 200, 255);
  rect(0, 0, WIDTH, HEIGHT);
  if (fps == 0) {
    // Only try once
    fps = 1000/(Date.now() - start);
  }
  
  GC.update();
  InputFlags["click"] = false;
  GC.prevTime = millis();
  
  window.requestAnimationFrame(loop);
}

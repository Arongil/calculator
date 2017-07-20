var canvas, ctx;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var MAPRADIUS, BOUNDARYWIDTH;

var DRAG = 0.995, G = 0.000000000067408;

var GC;

var pi = Math.PI;

var crosshairSize;

var start;

var InputFlags = {
  // 65 is the a key. 68 is the d key. 83 is the s key. 87 is the w key. 32 is the space bar.
  "32": false,
  "65": false,
  "68": false,
  "83": false,
  "87": false,
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

var Polygon = (function() {
  
  function Polygon(x, y, radius, theta, sides) {
    this.pos = new Vector2D(x, y);
    this.radius = radius;
    this.theta = theta;
    this.sides = sides;
  }
  
  Polygon.w = function(theta, sides) {
    return 1 / Math.cos(theta - 2*pi/sides * Math.round(sides/(2*pi) * theta));
  };
  
  Polygon.vtx = function(theta, sides) {
    return 2*pi/sides * (Math.floor(sides/(2*pi) * theta) + 1/2);
  };
  
  Polygon.nearestVertex = function(a, thetaab) {
    // Returns the nearest of a's vertices to a's distance-vector-insterection-point.
    var av, aor;
    aor = a.radius / Math.cos(pi / a.sides);
    av = Polygon.vtx(thetaab - a.theta, a.sides);
    return Vector2D.FromPolar(av + a.theta, aor);
  };
  
  Polygon.collision = function(a, b) {
    var davbx, davby, thetaavb, davbSquared, acb, nv;
    nv = Polygon.nearestVertex(a, Math.atan2(a.pos.y - b.pos.y, a.pos.x - b.pos.x));
    davbx = a.pos.x + nv.x - b.pos.x;
    davby = a.pos.y + nv.y - b.pos.y;
    thetaavb = Math.atan2(davby, davbx);
    davbSquared = davbx*davbx + davby*davby;
    acb = davbSquared <= Math.pow(b.radius * Polygon.w(thetaavb - b.theta, b.sides), 2);
    if (acb) {
      // Collision!
      return true;
    }
    else {
      // Check from b to a now for a collision.
      var dbvax, dbvay, thetabva, dbvaSquared, bca, nv;
      nv = Polygon.nearestVertex(b, Math.atan2(b.pos.y - a.pos.y, b.pos.x - a.pos.x));
      dbvax = b.pos.x + nv.x - a.pos.x;
      dbvay = b.pos.y + nv.y - a.pos.y;
      thetabva = Math.atan2(dbvay, dbvax);
      dbvaSquared = dbvax*dbvax + dbvay*dbvay;
      bca = dbvaSquared <= Math.pow(a.radius * Polygon.w(thetabva - a.theta, a.sides), 2);
      if (bca) {
        // Collision!
        return true;
      }
      else {
        // No Collision.
        return false;
      }
    }
  };
  
  return Polygon;
}());

var Player = (function() {
  
  function Player(x, y, radius, theta, speed, turnSpeed) {
    this.pos = new Vector2D(x, y);
    this.vel = new Vector2D(0, 0);
    this.radius = radius;
    this.circumRadius = 2*radius;
    this.sides = 3;
    this.theta = theta;
    this.omega = 0;
    this.speed = speed;
    // Void is a measure of remaining energy. Void is automatically collected from the surrounding emptiness, and is used to fuel movement and the dark laser. Ranges from 0 to 100.
    this.void = 0;
    this.voidCap = 100;
    this.voidGeneration = 1/2;
    this.voidFlameCost = 1/3;
    this.darkLaserCost = 2/3;
    this.darkWhirlCost = 4/3;
    this.darkWhirling = false;
    // The higher the turnSpeed, the slower and more smooth a turn is.
    this.turnSpeed = turnSpeed;
    
    this.darkLaser = new DarkLaser(this, 3*this.radius);
  }
  
  Player.prototype.updateVoid = function() {
    // Display void reserves.
    this.displayVoid();
    
    // Regenerate void.
    if (this.void < this.voidCap) {
      this.void += this.voidGeneration;
      if (this.void > this.voidCap) {
        this.void = this.voidCap;
      }
    }
    
    // Void depletion due to movement or the dark laser.
    var left = InputFlags["65"];
    var up = InputFlags["87"];
    var right = InputFlags["68"];
    var down = InputFlags["83"];
    var space = InputFlags["32"];
    if (space) {
      left = true;
      up = true;
      right = true;
      down = true;
    }
    if (left && up && right && this.void > this.darkWhirlCost) {
      // Special ability activated: void whirl.
      this.darkWhirling = true;
      this.omega += 1/100 * pi;
      this.void -= this.darkWhirlCost;
    }
    else {
      this.darkWhirling = false;
      if (left && this.void > this.voidFlameCost) {
        this.void -= this.voidFlameCost;
      }
      if (up && this.void > this.voidFlameCost) {
        this.void -= this.voidFlameCost;
      }
      if (right && this.void > this.voidFlameCost) {
        this.void -= this.voidFlameCost;
      }
      if (down && this.void > this.darkLaserCost) {
        this.void -= this.darkLaserCost;
      }
    }
  };
  
  Player.prototype.displayVoid = function() {
    ctx.save();
    
    var voidPercentage = this.void / this.voidCap;
    
    ctx.translate(3/4 * HALFWIDTH, -3/4 * HALFHEIGHT + 1/4 * HALFHEIGHT);
    
    stroke(160, 160, 160);
    strokeWeight(WIDTH / 300);
    fill(120, 120, 120);
    rect(0, 0, 1/5 * WIDTH, 1/25 * HALFHEIGHT);
    fill(100, 30, 220);
    rect(1/10 * WIDTH*(voidPercentage - 1), 0, 1/5 * WIDTH * voidPercentage, 1/25 * HALFHEIGHT);
    
    ctx.restore();
  };
  
  Player.prototype.fly = function() {
    // Boost with the rockets.
    if (InputFlags["65"] && this.void > this.voidFlameCost) {
      // Left arrow key.
      var leftTheta = this.theta + 5/3 * pi;
      this.vel.shift(Vector2D.FromPolar(leftTheta + pi, this.speed));
    }
    if (InputFlags["87"] && this.void > this.voidFlameCost) {
      // up arrow key.
      var downTheta = this.theta + pi;
      this.vel.shift(Vector2D.FromPolar(downTheta + pi, this.speed));
    }
    if (InputFlags["68"] && this.void > this.voidFlameCost) {
      // Right arrow key.
      var rightTheta = this.theta + 1/3 * pi;
      this.vel.shift(Vector2D.FromPolar(rightTheta + pi, this.speed));
    }
    
    // Turn towards the mouse, if not void whirling.
    if (this.darkWhirling == false) {
      if (Math.pow(this.radius, 2) <= Math.pow(InputFlags["mousepos"]["y"] - this.pos.y, 2) + Math.pow(InputFlags["mousepos"]["x"] - this.pos.x, 2)) {
        // Make sure the mouse isn't within the triangle's innerRadius.
        var angleToMouse = Math.atan2(InputFlags["mousepos"]["y"], InputFlags["mousepos"]["x"]);
        // Correct to the right ranges.
        if (angleToMouse < 0) {
          angleToMouse += 2*pi;
        }
        this.theta -= 2*pi*Math.floor(this.theta / (2*pi));
        var angleDiff = angleToMouse - this.theta;
        if (Math.abs(angleDiff) < this.turnSpeed*pi) {
          // If the turnspeed will overshoot, resulting in oscillations, just warp to the necessary angle to bypass the problem.
          this.theta = angleToMouse;
        }
        else {
          if (Math.abs(angleDiff) > pi) {
            this.theta -= pi*this.turnSpeed*Math.sign(angleDiff);
          }
          else {
            this.theta += pi*this.turnSpeed*Math.sign(angleDiff);
          }
        }
      }
    }
    this.omega *= 0.9;
    this.theta += this.omega;
    
    // Activate the dark laser if the down key (keycode: 40) is pressed.
    this.darkLaser.activated = InputFlags["83"] || InputFlags["32"];
    if (this.void < this.darkLaserCost) {
      this.darkLaser.activated = false;
    }
    
    this.updateVoid();
    
    this.vel.scale(DRAG);
    this.pos.shift(this.vel);
  };
  
  Player.prototype.drawFlame = function(pos, theta, size) {
    // The furthest out the flame goes.
    var flamePointPos = Vector2D.FromPolar(theta, size);
    // The side of the flame.
    var flameEdgePos = Vector2D.FromPolar(theta + pi/2, size/2);
    
    fill(100, 30, 220);
    stroke(100, 30, 220);
    triangle(pos.x + flamePointPos.x, pos.y + flamePointPos.y, pos.x + flameEdgePos.x, pos.y + flameEdgePos.y, pos.x - flameEdgePos.x, pos.y - flameEdgePos.y);
  };
  
  Player.prototype.display = function(pos) {
    if (pos === undefined) {
      pos = this.pos.clone();
    }
    if (InputFlags["65"] || InputFlags["32"] && this.void > this.voidFlameCost) {
      // Left arrow key.
      var leftTheta = this.theta + 5/3 * pi;
      this.drawFlame(pos.getShifted(Vector2D.FromPolar(leftTheta, this.radius)), leftTheta, this.radius);
    }
    if (InputFlags["87"] || InputFlags["32"] && this.void > this.voidFlameCost) {
      // up arrow key.
      var downTheta = this.theta + pi;
      this.drawFlame(pos.getShifted(Vector2D.FromPolar(downTheta, this.radius)), downTheta, this.radius);
    }
    if (InputFlags["68"] || InputFlags["32"] && this.void > this.voidFlameCost) {
      // Right arrow key.
      var rightTheta = this.theta + 1/3 * pi;
      this.drawFlame(pos.getShifted(Vector2D.FromPolar(rightTheta, this.radius)), rightTheta, this.radius);
    }
    
    // Display the dark laser, if it's activated.
    if (this.darkLaser.activated) {
      this.darkLaser.display(pos);
    }
    
    // Find the point 2*radius (circumradius) and angle theta out. Find point 2 is angle theta + pi/3 and point 3 is angle theta + 2*pi/3. Draw lines between them to create the triangle.
    var p1 = Vector2D.FromPolar(this.theta, this.circumRadius).getShifted(pos);
    var p2 = Vector2D.FromPolar(this.theta + 2/3*pi, this.circumRadius).getShifted(pos);
    var p3 = Vector2D.FromPolar(this.theta + 4/3*pi, this.circumRadius).getShifted(pos);
    
    ctx.save();
    
    fill(200, 200, 200);
    stroke(200, 200, 200);
    triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    stroke(0, 100, 0);
    strokeWeight(HALFWIDTH / 250);
    line(pos.x, pos.y, p1.x, p1.y);
    
    ctx.restore();
  };
  
  return Player;
}());

var DarkLaser = (function() {
  
  function darkLaser(host, size) {
    this.host = host;
    this.size = size;
    this.widthAngle = pi/6;
    this.activated = false;
  }
  
  darkLaser.prototype.display = function(pos) {
    if (pos === undefined) {
      pos = this.host.pos;
    }
    var p1 = pos.getShifted(Vector2D.FromPolar(this.host.theta, this.host.radius/2));
    var p2 = pos.getShifted(Vector2D.FromPolar(this.host.theta + this.widthAngle, this.host.radius*(1 + 1/Math.cos(this.widthAngle))));
    var p3 = pos.getShifted(Vector2D.FromPolar(this.host.theta - this.widthAngle, this.host.radius*(1 + 1/Math.cos(this.widthAngle))));
    var p4 = pos.getShifted(Vector2D.FromPolar(this.host.theta, 12 * this.host.radius));
    var points = [p1, p2, p4, p3];
    
    var brightness = 7/8 + Math.pow(Math.sin(millis() / 1600), 2)/4;
    
    ctx.save();
    
    fill(50*brightness, 50*brightness, 70*brightness);
    stroke(70, 50, 80);
    strokeWeight(1 + 2*Math.pow(Math.sin(millis() / 1200), 2));
    polygon(points);
    
    ctx.restore();
  };
  
  return darkLaser;
}());

var Asteroid = (function() {
  function Asteroid(pos, vel, radius, theta, omega) {
    this.pos = pos;
    this.vel = vel;
    this.radius = radius;
    this.density = 10000000;
    this.mass = 4/3 * pi * Math.pow(this.radius, 3) * this.density;
    this.theta = theta;
    this.omega = omega;
    this.sides = 5;
  }
  
  Asteroid.prototype.attract = function(object) {
    var distSquared = Math.pow(this.pos.x - object.pos.x, 2) + Math.pow(this.pos.y - object.pos.y, 2);
    if (distSquared > this.radius * this.radius / 25) {
      // Create a deadzone inside the asteroid so that divide by zero errors and superfast gravity attraction never happen.
      var angle = Math.atan2(this.pos.y - object.pos.y, this.pos.x - object.pos.x);
      var strength = G * this.mass / (distSquared);
      object.vel.shift(Vector2D.FromPolar(angle, strength));
    }
  };
  
  Asteroid.prototype.update = function() {
    // Check for a collision.
    var collision = Polygon.collision(this, GC.player);
    // Gravitationally attract the other entities, including the other asteroids.
    if (!collision) {
      this.attract(GC.player);
    }
    for (var i = 0; i < GC.asteroids.length; i++) {
      var asteroid = GC.asteroids[i];
      if (asteroid !== this) {
        //this.attract(asteroid);
      }
    }
    
    this.theta += this.omega;
    this.pos.shift(this.vel);
  };
  
  Asteroid.prototype.display = function(pos) {
    if (pos === undefined) {
      pos = this.pos.clone();
    }
    
    // Define the polygon's vertices.
    var points = [];
    for (var i = 0; i < this.sides; i++) {
      points.push(pos.getShifted(Vector2D.FromPolar(this.theta + 2/this.sides * pi * i, this.radius)));
    }
    
    // Display the polygon.
    fill(100, 110, 120);
    stroke(100, 110, 120);
    polygon(points);
  };
  
  return Asteroid;
}());

var Star = (function() {
  
  function Star(x, y, size) {
    this.pos = new Vector2D(x, y);
    this.size = size;
    this.phase = Math.random() * 2*pi;
    this.frequency = (Math.random() + 1) / 1000;
  }
  
  Star.prototype.scintillate = function() {
    var brightness = (3/4 + Math.random()/2) * (this.size * 500/HALFWIDTH);
    fill(100 * brightness, 100 * brightness, 100 * brightness);
    stroke(100 * brightness, 100 * brightness, 100 * brightness);
    var currentSize = this.size * Math.pow(Math.sin(this.frequency * millis() + this.phase), 2);
    ellipse(this.pos.x, this.pos.y, currentSize, currentSize);
  };
  
  return Star;
}());

var Camera = (function() {
  
  function Camera() {
    this.pos = new Vector2D(0, 0);
    // 0 to 1, one as no delay, 0 as infinite delay.
    this.trailDelay = 0.5;
  }
  
  return Camera;
}());

var GameController = (function() {
  
  function GameController() {
    this.stars = [];
    for (var i = 0; i < 150; i++) {
      this.stars.push(new Star(Math.random()*WIDTH - HALFWIDTH, Math.random()*HEIGHT - HALFHEIGHT, Math.random()*HALFWIDTH/500));
    }
    this.player = new Player(0, 0, HALFWIDTH / 20, 0, WIDTH / 5000, 0.02);
    this.asteroids = [];
    for (var i = 0; i < 5; i++) {
      this.asteroids.push(new Asteroid(Vector2D.FromPolar(2*pi * Math.random(), (Math.random() + 1)/2 * MAPRADIUS), Vector2D.FromPolar(2*pi * Math.random(), WIDTH / 200), WIDTH / 4 * (Math.random() + 2)/3, 0,0));//2*pi * Math.random(), 1/60 * pi * (Math.random()+1)/4));
    }
    
    this.camera = new Camera();
  }
  
  GameController.prototype.update = function() {
    this.player.fly();
    // Change camera's position to change the object that it trails.
    this.cameraTrail();
    
    // Environment layer below
    for (var i = 0; i < this.stars.length; i++) {
      var star = this.stars[i];
      star.scintillate();
    }
    
    // Game layer
    ctx.save();
    
    ctx.translate(-this.camera.pos.x, -this.camera.pos.y);
    for (var i = 0; i < this.asteroids.length; i++) {
      var asteroid = this.asteroids[i];
      asteroid.update();
      asteroid.display();
    }
    
    this.player.display();
    
    // The Boundary
    this.updateBoundary();
    
    ctx.restore();
    
    // Environmental layer above
    this.displayMinimap();
    this.drawCrosshairs();
  };
  
  GameController.prototype.cameraTrail = function() {
    var posDiff = this.player.pos.getShifted(this.camera.pos.getScaled(-1));
    this.camera.pos.shift(posDiff.getScaled(this.camera.trailDelay));
  };
  
  GameController.prototype.displayMinimap = function() {
    ctx.save();
    
    ctx.translate(3/4 * HALFWIDTH, -3/4 * HALFHEIGHT);
    // The minimap container
    fill(100, 100, 100, 0.2);
    stroke(0, 200, 220);
    strokeWeight(1 + Math.pow(Math.sin(millis()/800), 2));
    ellipse(0, 0, 1/5 * HALFWIDTH, 1/5 * HALFHEIGHT);
    
    // Scaling is cumulative.
    // The asteroids
    ctx.scale(1/18, 1/18);
    for (var i = 0; i < this.asteroids.length; i++) {
      var asteroid = this.asteroids[i];
      asteroid.display(asteroid.pos.getScaled((18/5 * HALFWIDTH) / MAPRADIUS));
    }
    // The spaceship
    ctx.scale(3, 3);
    this.player.display(this.player.pos.getScaled((6/5 * HALFWIDTH) / MAPRADIUS));
    
    
    ctx.restore();
  };
  
  GameController.prototype.beyondBoundary = function(entity) {
    // Antipodize any who are beyond the boundary, as well as slightly disorienting them.
    if (Math.pow(MAPRADIUS - BOUNDARYWIDTH/2, 2) < entity.pos.x * entity.pos.x + entity.pos.y * entity.pos.y) {
      entity.pos.rotate(pi);
      entity.pos.scale(0.999);
      entity.vel.rotate(1/3 * pi * (Math.random() - 1/2));
    }
  };
  
  GameController.prototype.updateBoundary = function() {
    // Make the boundary pulsate, visually.
    var pulse = Math.pow(Math.sin(millis()/800), 2);
    var boundaryWidth = 2/5*BOUNDARYWIDTH*(2 + pulse);
    
    ctx.save();
    
    // Display the boundary
    stroke(0, 200, 220);
    fill(255, 255, 255, 0.02);
    strokeWeight(boundaryWidth);
    ellipse(0, 0, MAPRADIUS, MAPRADIUS);
    
    ctx.restore();
    
    // Apply an outwards force proportional to the instantaneous width of the boundary. Only when the boundary is thin will the player be able to pass.
    var distanceFactor = 0.25;
    var strength = pulse * distanceFactor * Math.pow((this.player.pos.x * this.player.pos.x + this.player.pos.y * this.player.pos.y) / (MAPRADIUS*MAPRADIUS) + WIDTH/8000, 9);
    this.player.vel.shift(Vector2D.FromPolar(pi + Math.atan2(this.player.pos.y, this.player.pos.x), strength));
    
    // Administer the antipodizing teleportation, if any entity is beyond the boundary.
    this.beyondBoundary(this.player)
    for (var i = 0; i < this.asteroids.length; i++) {
      var asteroid = this.asteroids[i];
      this.beyondBoundary(asteroid);
    }
  };
  
  GameController.prototype.drawCrosshairs = function() {
    // Draw crosshairs.
    var mouseX = InputFlags["mousepos"]["x"], mouseY = InputFlags["mousepos"]["y"];

    ctx.save();

    stroke(0, 180, 0, 200/255);
    strokeWeight(0);
    line(mouseX - crosshairSize, mouseY, mouseX + crosshairSize, mouseY);
    line(mouseX, mouseY - crosshairSize, mouseX, mouseY + crosshairSize);

    ctx.restore();
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
  ctx.stroke();
}
function ellipse(x, y, xRadius, yRadius) {
  ctx.beginPath();
  ctx.ellipse(x, y, xRadius, yRadius, 0, 0, 2*pi);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();
}
function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  // Line to the from the first point to the second.
  ctx.lineTo(x2, y2);
  // Line to the from the second point to the third.
  ctx.lineTo(x3, y3);
  // Line to the from the third point to the first.
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
function polygon(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  // Do lines between each point.
  for (var i = 0; i < points.length; i++) {
    var point = points[(i + 1) % points.length]
    ctx.lineTo(point.x, point.y);
  }
  ctx.closePath();
  ctx.fill();
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
  
  var body = document.getElementsByTagName("body")[0];
  body.onresize = resize;
  resize();
  
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  
  ctx.translate(HALFWIDTH, HALFHEIGHT);
  
  MAPRADIUS = 6 * WIDTH;
  BOUNDARYWIDTH = 3/50 * WIDTH;
  
  crosshairSize = WIDTH / 80;
  
  start = Date.now();
  
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
  ctx.save();
  
  fill(0, 0, 0);
  rect(0, 0, WIDTH, HEIGHT);
  
  GC.update();
  
  ctx.restore();
  
  InputFlags["click"] = false;
  window.requestAnimationFrame(loop);
}

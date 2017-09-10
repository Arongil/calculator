var canvas, ctx;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var pi = Math.PI,
    G = 1;

var start, doStroke;

var GC;

var InputFlags = {
  // 37 is the left arrow. 38 is the up arrow. 39 is the right arrow. 87 is w. 65 is a. 83 is s. 68 is d.
  "37": false,
  "38": false,
  "39": false,
  "40": false,
  "32": false,
  // "87": false,
  // "65": false,
  // "83": false,
  // "68": false,
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

var Ball = (function() {
  
  function Ball(x, y, xVel, yVel, isHypothetical = false) {
    this.pos = new Vector2D(x, y);
    this.vel = new Vector2D(xVel, yVel);
    this.radius = HALFWIDTH / 20;
    
    this.isHypothetical = isHypothetical;
  }
  
  Ball.prototype.clone = function() {
    return new Ball(this.pos.x, this.pos.y, this.vel.x, this.vel.y);
  };
  
  Ball.prototype.display = function() {
    fill(60, 200, 0);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
  };
  
  Ball.prototype.checkBoundaryCollisions = function() {
    if (this.pos.x - this.radius < -HALFWIDTH) {
      this.pos.x = -HALFWIDTH + this.radius;
      this.vel.x *= -1;
      if (!this.isHypothetical)
        GC.rightScore++;
    }
    if (this.pos.x + this.radius > HALFWIDTH) {
      this.pos.x = HALFWIDTH - this.radius;
      this.vel.x *= -1;
      if (!this.isHypothetical)
        GC.leftScore++;
    }
    if (this.pos.y - this.radius < -HALFHEIGHT) {
      this.pos.y = -HALFHEIGHT + this.radius;
      this.vel.y *= -1;
    }
    if (this.pos.y + this.radius > HALFHEIGHT) {
      this.pos.y = HALFHEIGHT - this.radius;
      this.vel.y *= -1;
    }
  };
  
  Ball.prototype.move = function(paddles) {
    var collision = false, i;
    this.vel.scale(0.9999);
    this.pos.x += this.vel.x;
    for (i = 0; i < paddles.length; i++) {
      if (paddles[i].collisionWith(this)) {
        collision = true;
        break;
      }
    }
    if (collision) {
      this.vel.x *= -1;
      this.pos.x += this.vel.x;
      collision = false;
    }
    this.pos.y += this.vel.y;
    for (i = 0; i < paddles.length; i++) {
      if (paddles[i].collisionWith(this)) {
        collision = true;
        break;
      }
    }
    if (collision) {
      this.vel.y *= -1;
      this.pos.y += this.vel.y;
      this.pos.x -= this.vel.x;
    }
    this.checkBoundaryCollisions();
  };
  
  Ball.prototype.update = function(paddles) {
    this.move(paddles);
    this.display();
  };
  
  return Ball;
}());

var GravityBall = (function() {
  
  function GravityBall(x, y, xVel, yVel) {
    this.pos = new Vector2D(x, y);
    this.vel = new Vector2D(xVel, yVel);
    this.radius = HALFWIDTH / 45;
  }
  
  GravityBall.prototype.clone = function() {
    return new GravityBall(this.pos.x, this.pos.y, this.vel.x, this.vel.y);
  };
  
  GravityBall.prototype.display = function() {
    fill(180, 180, 180);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
  };
  
  GravityBall.prototype.checkBoundaryCollisions = function() {
    if (this.pos.x - this.radius < -HALFWIDTH) {
      this.pos.x = -HALFWIDTH + this.radius;
      this.vel.x *= -1;
    }
    if (this.pos.x + this.radius > HALFWIDTH) {
      this.pos.x = HALFWIDTH - this.radius;
      this.vel.x *= -1;
    }
    if (this.pos.y - this.radius < -HALFHEIGHT) {
      this.pos.y = -HALFHEIGHT + this.radius;
      this.vel.y *= -1;
    }
    if (this.pos.y + this.radius > HALFHEIGHT) {
      this.pos.y = HALFHEIGHT - this.radius;
      this.vel.y *= -1;
    }
  };
  
  GravityBall.prototype.move = function() {
    this.checkBoundaryCollisions();
    this.pos.shift(this.vel);
  };
  
  GravityBall.prototype.attract = function(ball) {
    var differenceVector = this.pos.getShifted(ball.pos.getScaled(-1)),
        dist = differenceVector.getMagnitude();
    if (dist < 5)
      return
    // Assume the gravityBall and the ball have masses of WIDTH*WIDTH*0.00009 and 1, respectively.
    ball.vel.shift(differenceVector.getScaled(G * WIDTH*WIDTH*0.00009 / (dist*dist)));
  };
  
  GravityBall.prototype.update = function(ball) {
    this.move();
    this.attract(ball);
    this.display();
  };
  
  return GravityBall;
}());

var Paddle = (function() {
  
  function Paddle(x, y, AI, AILevel) {
    this.pos = new Vector2D(x, y);
    this.speed = HEIGHT / 100;
    this.width = WIDTH / 35;
    this.height = HEIGHT / 4;
    
    // AILevel is a number, either 1, 2, 3, or 4, corresponding to its skill. An AI of level 1 is okay, moving only when the ball is out of it's reach; An AI of level 2 is good, moving when the ball is halfway to leaving its range; An AI of level 3 is incredible, moving whenever the ball is above or below its paddle's center; and an AI of level 4 predicts the ball's future trajectory, setting its skill beyond any human.
    this.AI = AI;
    this.AILevel = AILevel;
    this.awaitingCollision = false;
    this.hypotheticalCollisionY = 0;
    
    this.otherPaddles;
  }
  
  Paddle.prototype.initOtherPaddles = function(GC) {
    this.otherPaddles = GC.paddles.filter(paddle => paddle !== this);
  };
  
  Paddle.prototype.display = function() {
    fill(200, 200, 220);
    noStroke();
    rect(this.pos.x, this.pos.y, this.width, this.height);
  };
  
  Paddle.prototype.move = function(ball, gravityBall) {
    if (this.AI) {
      if (this.AILevel < 4) {
        var heightDifferenceToActOn;
        if (this.AILevel == 1)
          heightDifferenceToActOn = this.height/2;
        else if (this.AILevel == 2)
          heightDifferenceToActOn = this.height/4;
        else if (this.AILevel == 3)
          heightDifferenceToActOn = 0
        if (ball.pos.y - this.pos.y < -heightDifferenceToActOn &&
           this.pos.y - this.height/2 > -HALFHEIGHT)
          this.pos.y -= this.speed;
        if (ball.pos.y - this.pos.y > heightDifferenceToActOn &&
           this.pos.y + this.height/2 < HALFHEIGHT)
          this.pos.y += this.speed;
      }
      else {
        // AI level 4: predict the ball's future trajectory.
        // Calculate max frames given speed (t=d/r) to the furthest end of the screen.
        // Forward until this maximum of frames have been hit, update a hypothetical ball.
        // If the hypothetical ball ever scores a point on this, find the y-position of the score.
        // Move to that weak point to defend it.
        // Recheck for changed conditions (enemy paddle's moves) every 10 frames.
        // (AILevel 5 is for show: they will predict up to a few minutes ahead for the next collision. AILevel 4 is the maximal functionality for minimal computation.)
        if (!this.awaitingCollision || this.framesUntilCollision % 10 == 1) {
          var hypotheticalBall = new Ball(ball.pos.x, ball.pos.y, ball.vel.x, ball.vel.y, true),
              hypotheticalGravityBall = gravityBall.clone(),
              framesToEnd = Math.ceil((HEIGHT - this.height/2) / this.speed);
          this.awaitingCollision = false;
          for (var i = 0; i < framesToEnd * (this.AILevel == 5 ? 100 : 1); i++) {
            hypotheticalGravityBall.move();
            hypotheticalGravityBall.attract(hypotheticalBall);
            hypotheticalBall.move(this.otherPaddles);
            if (Math.abs(hypotheticalBall.pos.x + hypotheticalBall.radius - this.pos.x) < this.width/2 ||
                Math.abs(hypotheticalBall.pos.x - hypotheticalBall.radius - this.pos.x) < this.width/2) {
              this.hypotheticalCollisionY = hypotheticalBall.pos.y;
              this.awaitingCollision = true;
              this.framesUntilCollision = i;
              break;
            }
          }
        }
        else {
          if (this.framesUntilCollision <= 0)
            this.awaitingCollision = false;
          else
            this.framesUntilCollision--;
        }
        if (!this.awaitingCollision)
          this.hypotheticalCollisionY = 0;
        if (this.pos.y - this.hypotheticalCollisionY > this.speed && this.pos.y - this.height/2 > -HALFHEIGHT)
          this.pos.y -= this.speed;
        if (this.pos.y - this.hypotheticalCollisionY < -this.speed && this.pos.y + this.height/2 < HALFHEIGHT)
          this.pos.y += this.speed;
      }
      return;
    };
    if (InputFlags["37"] && this.pos.y - this.height/2 > -HALFHEIGHT) {
      this.pos.y -= this.speed;
    }
    if (InputFlags["39"] && this.pos.y + this.height/2 < HALFHEIGHT) {
      this.pos.y += this.speed;
    }
    if (InputFlags["38"]) {
      // Reserved for rocket-jump.
    }
  };
  
  Paddle.prototype.collisionWith = function(ball) {
    return ball.pos.x - ball.radius < this.pos.x + this.width/2 &&
      ball.pos.x + ball.radius > this.pos.x - this.width/2 &&
      ball.pos.y - ball.radius < this.pos.y + this.height/2 &&
      ball.pos.y + ball.radius > this.pos.y - this.height/2;
  };
  
  Paddle.prototype.update = function(ball, gravityBall) {
    this.move(ball, gravityBall);
    this.display();
  };
  
  return Paddle;
}());

var GameController = (function() {
  
  function GameController() {
    this.ball = new Ball(
      0, -HALFHEIGHT / 2,
      Math.random() > 0.5 ? HALFWIDTH / 55 : -HALFWIDTH / 55, (Math.random()*2 - 1) * HALFHEIGHT / 50);
    this.gravityBall = new GravityBall(
      0, 0, 0, Math.random() > 0.5 ? HALFHEIGHT / 60 : -HALFHEIGHT / 60);
    this.paddles = [
      new Paddle(-HALFWIDTH + WIDTH/70, 0, true, 4),
      new Paddle(HALFWIDTH - WIDTH/70, 0, true, 5)
    ];
    this.paddles.forEach(paddle => paddle.initOtherPaddles(this), this);
    
    this.leftScore = 0;
    this.rightScore = 0;
  }
  
  GameController.prototype.update = function() {
    this.gravityBall.update(this.ball);
    this.ball.update(this.paddles);
    for (var i = 0; i < this.paddles.length; i++)
      this.paddles[i].update(this.ball, this.gravityBall);
    this.displayScores();
  };
  
  GameController.prototype.displayScores = function() {
    fill(220, 220, 220);
    textSize(HALFWIDTH / 10);
    text(this.leftScore, -HALFWIDTH / 4, -0.85 * HALFHEIGHT);
    text(this.rightScore, HALFWIDTH / 4, -0.85 * HALFHEIGHT);
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
function noStroke() {
  doStroke = false;
}
function stroke(red, green, blue) {
  ctx.strokeStyle = "rgb("+Math.floor(red)+","+Math.floor(green)+","+Math.floor(blue)+")";
  doStroke = true;
}
function strokeWeight(weight) {
  ctx.lineWidth = weight;
  doStroke = true;
}
function rect(x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x - width/2, y - height/2, width, height);
  ctx.closePath();
  ctx.fill();
  if (doStroke) {
    ctx.stroke();
  }
}
function ellipse(x, y, xRadius, yRadius) {
  ctx.beginPath();
  ctx.ellipse(x, y, xRadius, yRadius, 0, 0, 2*pi);
  ctx.closePath();
  ctx.fill();
  if (doStroke) {
    ctx.stroke();
  }
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
  if (doStroke) {
    ctx.stroke();
  }
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
  if (doStroke) {
    ctx.stroke();
  }
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
  
  start = Date.now();
  doStroke = true;
  
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
  
  fill(20, 20, 20);
  rect(0, 0, WIDTH, HEIGHT);
  
  GC.update();
  
  ctx.restore();
  
  InputFlags["click"] = false;
  window.requestAnimationFrame(loop);
}

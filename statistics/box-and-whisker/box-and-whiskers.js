var canvas, ctx;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var pi = Math.PI;

var start, doStroke;

var GC;

var InputFlags = {
  // 37 is the left arrow. 38 is the up arrow. 39 is the right arrow.
  "37": false,
  "38": false,
  "39": false,
  "40": false,
  "32": false,
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

var GameController = (function() {
  
  function GameController() {
    this.lineDensity = Math.floor(WIDTH/40)*2 + 1;
  }
  
  GameController.prototype.linedPaper = function() {
    fill(255, 248, 227);
    rect(0, 0, WIDTH, HEIGHT);
    
    strokeWeight(1);
    for (var i = 0; i < this.lineDensity; i++) {
      if (i%Math.floor(this.lineDensity/6) === 0)
        stroke(116, 172, 205);
      else
        stroke(166, 222, 255);
      
      line(-WIDTH/2 + i * WIDTH/this.lineDensity + WIDTH / (this.lineDensity * 2), -HEIGHT/2, -WIDTH/2 + i * WIDTH/this.lineDensity + WIDTH / (this.lineDensity * 2), HEIGHT / 2);
      line(-WIDTH/2, -HEIGHT/2 + i * HEIGHT / this.lineDensity + HEIGHT / (this.lineDensity * 2), WIDTH / 2, -HEIGHT/2 + i * HEIGHT / this.lineDensity + HEIGHT / (this.lineDensity * 2));
    }
    stroke(0, 0, 0);
    strokeWeight(3);
    line(-WIDTH/2, HEIGHT/2 - HEIGHT / (this.lineDensity * 2), WIDTH/2, HEIGHT/2 - HEIGHT / (this.lineDensity * 2));
    line(-WIDTH/2 + WIDTH / (this.lineDensity * 2), -HEIGHT/2, -WIDTH/2 + WIDTH / (this.lineDensity * 2), HEIGHT/2);
  };
  
  GameController.prototype.fiveNumberSummary = function(Q0, Q1, Q2, Q3, Q4) {
    document.getElementById("Q0").textContent = Q0.toFixed(2);
    document.getElementById("Q1").textContent = Q1.toFixed(2);
    document.getElementById("Q2").textContent = Q2.toFixed(2);
    document.getElementById("Q3").textContent = Q3.toFixed(2);
    document.getElementById("Q4").textContent = Q4.toFixed(2);
  };
  
  GameController.prototype.boxAndWhisker = function(data) {
    if (data.length == 0) return;
    console.log(data);
    var sorted = data.sort( (a, b) => b - a < 0);
    var median = (arr) => arr.length%2 == 1 ? arr[arr.length/2 - 0.5] : (arr[arr.length/2 - 1] + arr[arr.length/2])/2;
    var firstHalf = sorted.slice(0, sorted.length/2),
        secondHalf = sorted.slice(sorted.length/2, sorted.length);
    var Q1 = median(firstHalf),
        Q2 = median(sorted),
        Q3 = median(secondHalf),
        IQR = Q3 - Q1,
        highOutlierBound = Q3 + 1.5*IQR,
        lowOutlierBound = Q1 - 1.5*IQR;
    var lowOutliers = sorted.filter( datum => datum < lowOutlierBound ),
        highOutliers = sorted.filter( datum => datum > highOutlierBound ),
        Q0 = sorted[lowOutliers.length],
        Q4 = sorted[sorted.length - 1 - highOutliers.length];
    
    this.fiveNumberSummary(Q0, Q1, Q2, Q3, Q4);
    
    // Scale to fit display.
    for (var i = 0, mag = 0; i < sorted.length; i++) {
      mag += sorted[i] * sorted[i]
    }
    mag = Math.sqrt(mag);
    // Fit to display.
    mag /= WIDTH * 5/11;
    Q0 /= mag; Q1 /= mag; Q2 /= mag; Q3 /= mag; Q4 /= mag;
    IQR /= mag; lowOutlierBound /= mag; highOutlierBound /= mag;
    lowOutliers = lowOutliers.map( x => x / mag );
    highOutliers = highOutliers.map( x => x / mag );
    
    // Draw the box and whisker plot.
    strokeWeight(2);
    stroke(0, 0, 0);
    fill(200, 200, 200);
    rect(Q1 + IQR/2, HEIGHT/6, IQR, HEIGHT/6);
    line(Q2, HEIGHT/12, Q2, 3*HEIGHT/12)
    line((lowOutliers.length == 0 ? Q0 : lowOutlierBound), HEIGHT/6, Q1, HEIGHT/6);
    line(Q3, HEIGHT/6, (highOutliers.length == 0 ? Q4 : highOutlierBound), HEIGHT/6);
    // Draw outliers.
    stroke(0, 0, 0)
    fill(0, 0, 0);
    lowOutliers.forEach( outlier => ellipse(outlier, HEIGHT/6, WIDTH/200, WIDTH/200) );
    highOutliers.forEach( outlier => ellipse(outlier, HEIGHT/6, WIDTH/200, WIDTH/200) );
  };
  
  GameController.prototype.isNumber = function(a) {
    return a == "0" || a == "1" || a == "2" || a == "3" || a == "4" || a == "5" || a == "6" || a == "7" || a == "8" || a == "9";
  }
  
  GameController.prototype.testBoxAndWhiskers = function() {
    var data = document.getElementById("data").value;
    if (data.length > 2) {
      var valid = true, data = data.split(""), cleanData = [""], i, datum;
      for (i = 0; i < data.length; i++) {
        datum = data[i];
        if (i === data.length - 1 && !this.isNumber(datum))
          break;
        if (datum === ",") {
          cleanData.push("");
        }
        else if (this.isNumber(datum) || datum === "." || datum == "-") {
          cleanData[cleanData.length - 1] += datum;
        }
        else if (datum === "[" || datum === "]" || datum === " ") {}
        else {
          valid = false;
          break;
        }
      }
      if (valid) {
        this.boxAndWhisker(cleanData.map( datum => parseFloat(datum) ));
      }
    }
  };
  
  GameController.prototype.update = function() {
    this.linedPaper();
    this.testBoxAndWhiskers();
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
  
  fill(200, 200, 200);
  rect(0, 0, WIDTH, HEIGHT);
  
  GC.update();
  
  ctx.restore();
  
  InputFlags["click"] = false;
  window.requestAnimationFrame(loop);
}

window.onload = init;

var canvas, ctx;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var fourier;

var start = 0, now;

const pi = Math.PI;

var InputFlags = {
    // 32 = space bar, 37 = left arrow, 38 = up arrow, 39 = right arrow, 40 = down arrow, 65 = a, 67 = c, 70 = f.
    "32": false,
    "37": false,
    "38": false,
    "39": false,
    "40": false,
    "65": false,
    "67": false,
    "70": false,
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
    Vector2D.ToPolar = function(vector) {
        return new Vector2D(Math.atan2(vector.y, vector.x), vector.getMagnitude());
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

    Vector2D.prototype.mult = function(other) {
        var x = this.x;
        this.x = x * other.x - this.y * other.y;
        this.y = x * other.y + this.y * other.x;
    }
    Vector2D.prototype.getMult = function(other) {
        return new Vector2D(this.x * other.x - this.y * other.y, this.x * other.y + this.y * other.x);
    }

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

class Fourier {

    constructor() {
        this.points = []; // Vector2Ds
        this.weights = []; // weights for the different frequencies
        // The number of terms used in the Fourier approximation.
        this.min = -50;
        this.max = 50;
        this.range = this.max - this.min;
        this.integrationSteps = 4000; // The precision of the numerical integration.

        this.all = false; // Draw all of the Fourier loop at once or animate it.
        this.allPrecision = 400; // The number of points drawn when this.all is true.
        this.time = 10; // The time a cycle will take when this.all is false.
        this.cyclesVisible = true; // Do or don't draw the rotating circles.
        this.drawDots = true; // Draw the dots.
        this.firstLastConnect = false; // Connect the first and last dots.

        this.settingsDisplay = document.getElementById("settings-display");
    }

    settings() {
        if (InputFlags["38"]) { // up arrow
            if (this.range < 199) {
                this.min--;
                this.max++;
                this.range += 2;
                if (this.points.length > 0) {
                    this.updateWeights();
                }
            }
        } else if (InputFlags["40"]) { // down arrow
            if (this.range > 3) {
                this.min++;
                this.max--;
                this.range -= 2;
                if (this.points.length > 0) {
                    this.updateWeights();
                }
            }
        } else if (InputFlags["37"]) { // left arrow
            if (this.time > 0.2) {
                this.time *= 0.99;
            }
        } else if (InputFlags["39"]) { // right arrow
            this.time *= 1.01;
        }

        this.settingsDisplay.innerHTML = "Circles: " + (this.range + 1) + "; Draw Time: " + (Math.floor(this.time * 10)/10) + "; Dot Display: " + this.drawDots + "; Fourier Circle Display: " + this.cyclesVisible + "; All Trace: " + this.all;
    }

    getInterpolation(t) {
        if (this.points.length == 1)
            return this.points[0];
        if (t == 1)
            return this.points[this.points.length - 1];
        // For 0 < t < 1, return an interpolation between the nearest two data points.
        var continuousPoint = (this.points.length - 1) * t,
            pointA = this.points[Math.floor(continuousPoint)],
            pointB = this.points[Math.floor(continuousPoint) + 1],
            t = continuousPoint - Math.floor(continuousPoint);
        return pointA.getScaled(1 - t).getShifted( pointB.getScaled(t) );
    }

    average(freq) {
        var total = new Vector2D(0, 0), interpolation;
        for (var i = 0; i <= this.integrationSteps; i++) {
            interpolation = this.getInterpolation(i / this.integrationSteps);
            total.shift(interpolation.getMult(Vector2D.FromPolar(2*pi * -freq * i / this.integrationSteps, 1)));
        }
        total.scale(1 / this.integrationSteps);
        return total;
    }

    updateWeights() {
        // Assume the data points are equally spread out in time.
        this.weights = [];
        for (var freq = this.min; freq <= this.max; freq++) {
            this.weights.push(this.average(freq));
        }
    }

    updatePoints() {
        if (InputFlags["click"]) {
            this.points.push(new Vector2D(InputFlags["mousepos"]["x"], InputFlags["mousepos"]["y"]));
            this.updateWeights();
        }
    }

    displayDots() {
        for (var i = 0; i < this.points.length; i++) {
            fill(200, 200, 200);
            ellipse(this.points[i].x, this.points[i].y, WIDTH/200, WIDTH/200);
            if (i > 0) {
                strokeWeight(WIDTH/400);
                stroke(200, 200, 200);
                line(this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y);
            }
        }
    }

    drawFourierPoint(t) {
        var total = new Vector2D(0, 0), prev = new Vector2D(0, 0);
        for (var i = this.min; i <= this.max; i++) {
            total.shift( this.weights[i - this.min].getMult( Vector2D.FromPolar( 2*pi * i * t, 1 ) ) );
            if (this.cyclesVisible) {
                strokeWeight(WIDTH/400);
                stroke(200, 0, 0);
                line(prev.x, prev.y, total.x, total.y);
                fill(0, 0, 0, 0);
                stroke(0, 200, 0);
                var mag = this.weights[i - this.min].getMagnitude();
                ellipse(prev.x, prev.y, mag, mag, true);
            }
            prev = total.clone();
        }
        if (!this.prev) { // If this.prev is undefined, define it and don't draw. This avoids the first line starting at the center.
            this.prev = total;
            return;
        }
        else {
            strokeWeight(WIDTH/200);
            stroke(200, 0, 0);
            fill(200, 0, 0);
            line(this.prev.x, this.prev.y, total.x, total.y);
            if (!this.all) {
                ellipse(total.x, total.y, WIDTH/100, WIDTH/100);
            }
            this.prev = total;
        }
    }
    displayFourier() {
        if (this.points.length == 0) {
            return;
        }
        if (this.all) {
            for (var iter = 0; iter < this.allPrecision; iter++) {
                var t = iter / this.allPrecision;
                this.drawFourierPoint(t);
            }
        }
        else {
            this.drawFourierPoint( (millis() / 1000 % this.time)/this.time );
        }
    }

    display() {
        this.displayFourier();
        if (this.drawDots) {
            this.displayDots();
        }
    }

    update() {
        this.updatePoints();
        this.display();
        this.settings();
    }
}

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
function ellipse(x, y, xRadius, yRadius, stroke = false) {
    ctx.beginPath();
    ctx.ellipse(x, y, xRadius, yRadius, 0, 0, 2*pi);
    ctx.closePath();
    ctx.fill()
    if (stroke) {
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

    fourier = new Fourier();

    window.requestAnimationFrame(loop);
}

function loop() {
    fill(0, 0, 0, 0.6);
    rect(0, 0, WIDTH, HEIGHT);

    fourier.update();
    InputFlags["click"] = false;

    window.requestAnimationFrame(loop);
}

init();

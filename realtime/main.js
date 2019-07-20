var canvas, ctx;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var graph;

var start;

/******************************/

class Graph {

    constructor() {
        this.speed = 0.05; // The speed at which the camera can move.
        this.turnSpeed = 0.01; // The speed at which the camera can rotate.
        this.init();
        this.active = false;

        this.lightStrength = document.getElementById("light-strength");
        this.ambientLight = document.getElementById("ambient-light");
        this.steps = document.getElementById("steps");
    }

    initFunction() {
        var fElement = document.getElementById("function"),
            functionString = fElement.value;
        eval("f = (x, y) => { " + (functionString.indexOf("return") == -1 ? "return " + functionString : functionString) + " };");
        // Check whether f is a scalar field or a parametric surface.
        parametric = f(0, 0) instanceof Array && f(0, 0).length == 3;
    }

    init() {
        this.initFunction();

        paths = [];
        this.active = true;
        drawFrame();
        drawSurface();
        drawPoints();

        // Render one pass.
        drawBackground();
        render();
    }

    input() {
        var movement = false; // Does the player move?
        var x = this.speed * Math.cos(rotation[2]),
            y = this.speed * Math.sin(rotation[2]);
        if (Keys.s) { camera[0] -= y; camera[1] -= x; movement = true; }
        if (Keys.w) { camera[0] += y; camera[1] += x; movement = true; }
        if (Keys.a) { camera[0] -= x; camera[1] += y; movement = true; }
        if (Keys.d) { camera[0] += x; camera[1] -= y; movement = true; }
        if (Keys.q) { camera[2] -= this.speed; movement = true; }
        if (Keys.e) { camera[2] += this.speed; movement = true; }

        if (Mouse.dx !== 0 || Mouse.dy !== 0) {
            movement = true;
            rotation[2] += this.turnSpeed * Mouse.dx;
            rotation[0] += this.turnSpeed * Mouse.dy;
            Mouse.dx = 0;
            Mouse.dy = 0;
        }

        if (rotation[0] > pi) {
            rotation[0] = pi;
        }
        if (rotation[0] < 0) {
            rotation[0] = 0;
        }
        rotation[1] %= 2*pi;
        rotation[2] %= 2*pi;

        lightUnitNormal = normalize(scale(camera, -1));
        return movement;
    }

    settings() {
        var oLightStrength = lightStrength,
            oAmbientLight = ambientLight,
            oSteps = steps;

        // Update lighting
        lightStrength = parseFloat(this.lightStrength.value);
        ambientLight = parseFloat(this.ambientLight.value);

        // Updates to steps require regraphing
        steps = parseInt(this.steps.value);
        if (oSteps !== steps) {
            this.init();
            this.active = false;
            // this.init handles all redrawing, so there's no need for this.update to redraw again.
            return false;
        }

        // Return if the user has fiddled with the settings.
        return oLightStrength !== lightStrength ||
               oAmbientLight !== ambientLight;
    }

    update() {
        var input = false, settings = false;
        if (this.active) {
            input = this.input();
        }
        settings = this.settings();
        if (input || settings) {
            // Only redraw if the player has changed their position or rotation,
            // OR if the player has fiddled with the settings.
            drawBackground();
            render();
        }
    }
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

  graph = new Graph();

  window.requestAnimationFrame(loop);
}

function loop() {
  ctx.save();

  graph.update();

  ctx.restore();

  window.requestAnimationFrame(loop);
}

init();

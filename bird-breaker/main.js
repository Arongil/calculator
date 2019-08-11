var canvas, ctx;
var WIDTH, HEIGHT, HALFWIDTH, HALFHEIGHT;

var GRAVITY;

var fps, now;

var GC;

const pi = Math.PI;

var debug = false;

/**************************************/

function hack() {
    // A hitch-hiker's guide to easy debugging. Call this method at your own peril.
    debug = true;
    GC.player.coins = 1e6;
}

/**************************************/

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

    GRAVITY = Math.sqrt(HEIGHT) / 245;

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

    fps = 0;
    start = Date.now();

    var body = document.getElementsByTagName("body")[0];
    body.onresize = resize;
    resize();

    GC = new GameController();

    window.requestAnimationFrame(loop);
}

function loop() {
    if (GC.slowMotionCheck()) {
        window.requestAnimationFrame(loop);
        return;
    }

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

window.onload = init;

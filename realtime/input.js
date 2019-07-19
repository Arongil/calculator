var Mouse = {
    "dx": 0,
    "dy": 0,
    "x": 0,
    "y": 0,
    "click": false,
};
var Keys = {
    // 65 is the a key. 68 is the d key. 83 is the s key. 87 is the w key. 81 is the q key. 69 is the e key.
    "81": false,
    "69": false,
    "65": false,
    "68": false,
    "83": false,
    "87": false,
    "16": false,
    "32": false,
    get w() { return Keys["87"]; },
    get a() { return Keys["65"]; },
    get s() { return Keys["83"]; },
    get d() { return Keys["68"]; },
    get q() { return Keys["81"]; },
    get e() { return Keys["69"]; },
    get shift() { return Keys["16"]; },
    get space() { return Keys["32"]; },
};

window.onkeydown = function(e) {
    if (Keys[e.keyCode] !== undefined) {
        Keys[e.keyCode] = true;
    }
};
window.onkeyup = function(e) {
    if (Keys[e.keyCode] !== undefined) {
        Keys[e.keyCode] = false;
    }
};
document.onmouseup = function(e) {
    Mouse["click"] = true;
};
function mousemove(e) {
    Mouse.dx = e.movementX;
    Mouse.dy = e.movementY;
    Mouse.x += e.movementX;
    Mouse.y += e.movementY;
}

// Lock the user's mouse so that it doesn't hit the edge of the screen.
var body = document.body, button = document.getElementById("click-start");
var havePointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
if (havePointerLock) {
    body.requestPointerLock = body.requestPointerLock || body.mozRequestPointerLock || body.webkitRequestPointerLock;
    body.exitPointerLock = body.exitPointerLock || body.mozExitPointerLock || body.webkitExitPointerLock;
    button.addEventListener("click", function() {
        if (!(body === document.pointerLockElement || body === document.mozPointerLockElement || body === document.webkitPointerLockElement)) {
            body.requestPointerLock();
            document.getElementById("instructions-box").style.display = "none";
            document.addEventListener("mousemove", mousemove, false);
            graph.init();
        } else {
            // document.exitPointerLock();
        }
    }, false);
    document.addEventListener("pointerlockchange", function() {
        if (!(body === document.pointerLockElement || body === document.mozPointerLockElement || body === document.webkitPointerLockElement)) {
            document.getElementById("instructions-box").style.display = "-webkit-box";
            document.getElementById("instructions-box").style.display = "-moz-box";
            document.getElementById("instructions-box").style.display = "box";
            document.removeEventListener("mousemove", mousemove, false);
            graph.active = false;
        }
    }, false);
}

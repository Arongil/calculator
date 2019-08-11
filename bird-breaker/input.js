var InputFlags = {
    // 32 is the space bar. 37 is left arrow. 39 is right arrow.
    "click": false,
    "mouseX": 0,
    "mouseY": 99999
};

window.onkeydown = function(e) {
    InputFlags[e.keyCode] = true;
};
window.onkeyup = function(e) {
    InputFlags[e.keyCode] = false;
};
document.onmouseup = function(e) {
    InputFlags["click"] = true;
};
document.onmousemove = function(e) {
    InputFlags["mouseX"] = e.clientX - window.innerWidth/2;
    InputFlags["mouseY"] = e.clientY - HALFHEIGHT - 8;
};

document.addEventListener("touchstart", function(e) {
    document.onmousemove(e.touches[0]);
    if (InputFlags["mouseX"] > 0) {
        // Right arrow key
        InputFlags["37"] = false;
        InputFlags["39"] = true;
    } else {
        // Left arrow key
        InputFlags["37"] = true;
        InputFlags["39"] = false;
    }
    e.preventDefault();
}, {passive: false});
document.addEventListener("touchmove", function(e) {
    document.onmousemove(e.touches[0]);
    if (InputFlags["mouseX"] > 0) {
        // Right arrow key
        InputFlags["37"] = false;
        InputFlags["39"] = true;
    } else {
        // Left arrow key
        InputFlags["37"] = true;
        InputFlags["39"] = false;
    }
    e.preventDefault();
}, {passive: false});
document.addEventListener("touchend", function(e) {
    document.onmouseup();
    InputFlags["37"] = false;
    InputFlags["39"] = false;
    e.preventDefault();
}, {passive: false});

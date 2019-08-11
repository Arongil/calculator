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
    ctx.fill()
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

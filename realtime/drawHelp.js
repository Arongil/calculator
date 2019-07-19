var pi = Math.PI;

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
function style(styleObj) {
  if (!!styleObj.fill) {
    var rgb = hexToRgb(styleObj.fill);
    fill(rgb.r, rgb.g, rgb.b);
  }
  if (!!styleObj.stroke) {
    if (styleObj.stroke === "none") {
        strokeWeight(0);
    }
    var rgb = hexToRgb(styleObj.stroke);
    stroke(rgb.r, rgb.g, rgb.b);
  }
  if (!!styleObj.strokeWidth) {
    strokeWeight(styleObj.strokeWidth);
  }
}
function rect(x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x - width/2, y - height/2, width, height);
  ctx.closePath();
  ctx.fill();
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
function ellipse(x, y, xRadius, yRadius, s) {
  style(s);
  ctx.beginPath();
  ctx.ellipse(x, y, xRadius, yRadius, 0, 0, 2*pi);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
function path(points, s) {
  style(s);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  // Do lines between each point.
  for (var i = 0; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.lineTo(points[0][0], points[0][1]);
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

function millis() {
  return Date.now() - start;
}

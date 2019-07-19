function copyCode() {
    var generateButton = document.getElementById("copy-code");
    generateButton.textContent = "working ...";

    var copyText = document.getElementById("hidden-copier");
    copyText.value = getCode();
    copyText.style.display = "inline";
    copyText.select();
    document.execCommand("copy");
    copyText.style.display = "none";

    generateButton.textContent = "Copied to Clipboard";
    window.setTimeout(() => {
        generateButton.textContent = "Generate Code";
    }, 1000);
}

function getCode() {
    // getCode returns the full Graphie code for the graph as viewed in this program.
    // Note: certain tweaks exist in this return code that must stay untouched.
    // DO NOT copy the code from this program into the return, even if it is similar.

    // Tentative list of all differences between the code in this program and the return code below.
    //// The entire globals block with its inserted parameters.
    //// Khan Academy approved color changes, i.e. a white background.
    //// // Reverse the y coordinate in projection.js because HTML5 canvas and Graphie draw the y coordinate in the opposite directions.

    var functionString = document.getElementById("function").value;
    var globals = `
/* The X and Y ranges of this canvas */
var range = [[-1, 1], [-1, 1]];
// The size of the output image. 320 for normal, 170 for small.
var size = 320;

// The number of steps used when drawing the surface. Bigger looks smoother but takes longer to compute. Recommended: 20.
var steps = ` + steps + `;
// The length of the axes.
var axisLength = ` + axisLength + `;
// The number of segments the axes are broken into.
var occlusionAccuracy = ` + occlusionAccuracy + `;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

function f(x, y) {
    // Write your scalar field here.
    ` + (functionString.indexOf("return") == -1 ? "return " + functionString : functionString) + `;
}

/*
Set points to be drawn on the surface; specify x, y, and color.
- if nothing else specified, it draws a point
- gradient: if true, must specify an arrowLength
- directional derivative: if true, must specify a direction
- vector: if true, must specify start and end points.
*/
var points = [];

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

var color1 = "#8AF281";
var color2 = "#80F6FF";
var zoom = 2;

// position of the camera
var camera = [` + camera +`];
// rotation of the camera, where the numbers in order mean rotation around the x, y, and z axes.
var rotation = [` + rotation + `];
// The unit-length direction that light travels (from the camera to the origin).
var lightUnitNormal = [` + lightUnitNormal + `];
var lightStrength = ` + lightStrength + `;
// ambientLight is a number between zero and one that adds a universal brightness to surfaces.
var ambientLight = ` + ambientLight + `;
    `;

    var everythingElse = `
/***** mathHelper.js *****/

function add(v1, v2) {
    if (v1.length == 2) {
      return [v1[0] + v2[0], v1[1] + v2[1]];
    } else if (v1.length == 3) {
      return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
    }
}
function scale(v, scalar) {
  if (v.length == 2) {
    return [v[0] * scalar, v[1] * scalar];
  } else if (v.length == 3) {
    return [v[0]  * scalar, v[1]  * scalar, v[2]  * scalar];
  }
}
function magnitude(v) {
  if (v.length == 2) {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
  } else if (v.length == 3) {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  }
}
function normalize(v) {
  return scale(v, 1 / magnitude(v));
}
function cross(v1, v2) {
    return [v1[1]*v2[2] - v1[2]*v2[1], v1[2]*v2[0] - v1[0]*v2[2], v1[0]*v2[1] - v1[1]*v2[0]];
}
function dot3D(v1, v2) {
    return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

// Return the derivative of f in the direction of v at point a.
function directionalDerivative(a, v) {
    var h = 1e-6;
    var shifted = add(a, scale(v, h));
    return (f(shifted[0], shifted[1]) - f(a[0], a[1])) / h;
}

// Return the gradient of f at point a.
function gradient(a) {
    return [directionalDerivative(a, [1, 0]), directionalDerivative(a, [0, 1])];
}

/***** hexHelper.js *****/

function hexToRgb(hex) {
    var result = [ hex[1] + hex[2], hex[3] + hex[4], hex[5] + hex[6] ];
    return {
        r: parseInt(result[0], 16),
        g: parseInt(result[1], 16),
        b: parseInt(result[2], 16)
    };
}

function componentToHex(c) {
    if (c > 255) {
        return "ff";
    }
    var hex = Math.floor(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/***** projection.js *****/

// Store all the paths to be drawn until the end so that occlusions can happen.
var paths = [];

function rotateX(point, angle) {
    var x = point[0], y = point[1], z = point[2];
    var temp = y;
    y = temp * Math.cos(angle) - z * Math.sin(angle);
    z = temp * Math.sin(angle) + z * Math.cos(angle);
    return [x, y, z];
}
function rotateY(point, angle) {
    var x = point[0], y = point[1], z = point[2];
    var temp = z;
    z = temp * Math.cos(angle) - x * Math.sin(angle);
    x = temp * Math.sin(angle) + x * Math.cos(angle);
    return [x, y, z];
}
function rotateZ(point, angle) {
    var x = point[0], y = point[1], z = point[2];
    var temp = x;
    x = temp * Math.cos(angle) - y * Math.sin(angle);
    y = temp * Math.sin(angle) + y * Math.cos(angle);
    return [x, y, z];
}
// Return point = [x, y, z] projected into 2D for the screen.
function proj(point) {
    // Shift the point by the camera's position.
    var shifted = [point[0] - camera[0], point[1] - camera[1], point[2] - camera[2]];
    // Rotate the point by the camera's rotation.
    var rotated = rotateX(
        rotateY(
            rotateZ(
                [shifted[0], shifted[1], shifted[2]],
            rotation[2]),
        rotation[1]),
    rotation[0]);
    if (rotated[2] <= 0 || rotated[2] > 100) {
        // Return false for points behind the camera or too far in front of it, which shouldn't be drawn.
        return false;
    }
    // Reverse the y coordinate here because HTML5 canvas and Graphie draw the y coordinate in the opposite directions.
    return [rotated[0] / rotated[2] * zoom, -rotated[1] / rotated[2] * zoom];
}

/***** render.js *****/

function calcDist() {
    // Find each path's distance to the camera, taking the distance of the farthest vertex.
    for (var i = 0; i < paths.length; i++) {
        if (paths[i].occlude === false) {
            // Certain paths can bypass occlusion.
            paths[i].dist = -1;
            continue;
        }
        var farthest = 0, temp, vertex;
        for (var j = 0; j < paths[i].vertices.length; j++) {
            vertex = paths[i].vertices[j];
            temp = Math.sqrt(
                Math.pow(vertex[0] - camera[0], 2) +
                Math.pow(vertex[1] - camera[1], 2) +
                Math.pow(vertex[2] - camera[2], 2)
            );
            if (temp > farthest) {
                farthest = temp;
            }
        }
        paths[i].dist = farthest;
    }
}

function project(p) {
    var vertices = [], projected;
    for (var j = 0; j < p.vertices.length; j++) {
        projected = proj(p.vertices[j]);
        if (!projected) {
            return false; // Return false if the path is behind the camera.
        }
        vertices.push(projected);
    }
    return vertices;
}

function renderPath(p) {
    // Don't alter color if the path is only a line.
    if (p.vertices.length > 2) {
        if (!p.style.fill) {
            p.style.fill = "#ffffff";
        }
        var diff1 = add(p.vertices[2], scale(p.vertices[0], -1)),
            diff2 = add(p.vertices[1], scale(p.vertices[0], -1)),
            surfaceNormal = cross(diff1, diff2);
        surfaceNormal = normalize(surfaceNormal);
        // colorScale is what to multiply the color by: the dot product of the surface normal and the light direction. Intuitively, there's 0% that hits a surface perpendicular to the light, and 100% hits a surface directly facing the light.
        colorScale = dot3D(surfaceNormal, lightUnitNormal);
        colorScale = (colorScale > 0 ? colorScale * lightStrength : 0) + ambientLight;
        if (colorScale > 1) {
            colorScale = 1;
        }
        var color = hexToRgb(p.style.fill);
        var newHex = rgbToHex(color.r * colorScale, color.g * colorScale, color.b * colorScale);
        p.style.fill = newHex;
        if (!p.style.stroke) {
            p.style.stroke = newHex;
        }
    }
    vertices = project(p);
    // Don't draw shapes behind the camera.
    if (vertices !== false) {
        path(vertices, p.style);
    }
    if (p.vertices.length > 2) {
        p.style.fill = rgbToHex(color.r, color.g, color.b);
    }
}

function renderPoint(p) {
    vertices = project(p);
    if (vertices === false) {
        return; // Don't draw shapes behind the camera.
    }
    drawCircle({
        center: vertices[0],
        radius: p.radius,
        style: {
            stroke: "none",
            fill: p.color
        }
    });
}

function render() {
    // Sort objects so that the first drawn are the farthest away.
    calcDist();
    paths.sort(function(a, b) {
        return b.dist - a.dist;
    });
    // Draw!
    for (var i = 0; i < paths.length; i++) {
        if (!paths[i].point) {
            renderPath(paths[i]);
        } else {
            renderPoint(paths[i]);
        }
    }
}

/***** graph.js *****/

// Given two indices, x and y, return the corresponding index in the vertices list. For example, if steps = 10, x = 3, and y = 4, then xyToVertex would return 3 + 4 * 10 = 43.
function xyToVertex(x, y) {
    return x + (steps + 1) * y;
}

function drawSurface() {
    // Starting from the lowest x and the lowest y, with steps elements until the next y value. There are steps*steps total vertices.
    var vertices = [];

    var x, y;
    for (var i = 0; i <= steps; i++) {
        for (var j = 0; j <= steps; j++) {
            x = range[0][0] + j/steps*(range[0][1] - range[0][0]);
            y = range[1][0] + i/steps*(range[1][1] - range[1][0]);
            vertices.push([x, y, f(x, y)]);
        }
    }

    var faces = [];

    // Always create the face from the current point toward positive x and positive y.
    for (var y = 0; y < steps; y++) {
        for (var x = 0; x < steps; x++) {
            faces.push({
                verts: [xyToVertex(x, y), xyToVertex(x + 1, y), xyToVertex(x + 1, y + 1), xyToVertex(x, y + 1)],
                color: (x + y) % 2 === 0 ? color1 : color2
            });
        }
    }

    for (var i = 0, face; i < faces.length; i++) {
        face = faces[i];
        var vert1 = vertices[face.verts[0]],
            vert2 = vertices[face.verts[1]],
            vert3 = vertices[face.verts[2]],
            vert4 = vertices[face.verts[3]];
        paths.push({
            "vertices": [vert1, vert2, vert3, vert4],
            "style": {
                fill: face.color,
                strokeWidth: 0.5,
                stroke: "#000000"
            }
        });
    }
}

function arrow(start, end, style) {
    var arrowBase = scale(add(start, scale(end, 2)), 1/3),
        diff = scale(add(end, scale(start, -1)), 0.1),
        perp1 = [0, diff[2], -diff[1]],
        perp2 = [-diff[2], 0, diff[0]],
        perpLength = Math.sqrt(Math.sqrt(diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2])) * 0.1;
    // Make perp1 and perp2 have equal magnitude.
    perp1 = scale(normalize(perp1), perpLength);
    perp2 = scale(normalize(perp2), perpLength);
    var tip1 = add(add(arrowBase, perp1), perp2),
        tip2 = add(add(arrowBase, perp1), scale(perp2, -1)),
        tip3 = add(add(arrowBase, scale(perp1, -1)), perp2),
        tip4 = add(add(arrowBase, scale(perp1, -1)), scale(perp2, -1));
    // The trunk of the arrow
    paths.push({
        "vertices": [start, end],
        "style": style,
        // "occlude": false
    });
    var styleNoStroke = Object.assign({}, style);
    styleNoStroke.stroke = "none";
    // The tips of the arrow
    paths.push({
        "vertices": [end, tip1, tip2],
        "style": styleNoStroke,
        // "occlude": false
    });
    paths.push({
        "vertices": [end, tip2, tip4],
        "style": styleNoStroke,
        // "occlude": false
    });
    paths.push({
        "vertices": [end, tip4, tip3],
        "style": styleNoStroke,
        // "occlude": false
    });
    paths.push({
        "vertices": [end, tip3, tip1],
        "style": styleNoStroke,
        // "occlude": false
    });
}

// An arrow representing the directional derivative at point a in the direction of v.
function drawDirectionalDerivative(a, v, length, style) {
    if (v[0]*v[0] + v[1]*v[1] < 1e-6) {
        // If the direction is zero, skip drawing it.
        return;
    }
    v = normalize(v);
    var h = 1e-6;
    var start = [a[0], a[1], f(a[0], a[1])],
        end2D = add(a, normalize(v)),
        height = (f(a[0] + v[0]*h, a[1] + v[1]*h) - f(a[0], a[1])) / h,
        end = [end2D[0], end2D[1], f(a[0], a[1]) + height];
    end = add(scale(normalize(add(end, scale(start, -1))), length), start);
    arrow(start, end, style);
}

// An arrow representing the gradient at point a.
function drawGradient(a, length, style) {
    drawDirectionalDerivative(a, gradient(a), length, style);
}

function drawPoints() {
    for (var i = 0; i < points.length; i++) {
        // Check for whether the point is a gradient, directional derivative, vector, or else default to a regular point.
        if (!!points[i].gradient) {
            var length = 0.2;
            if (!!points[i].arrowLength) {
                length = points[i].arrowLength;
            }
            drawGradient([points[i].x, points[i].y], length, {
                fill: points[i].color,
                stroke: points[i].color
            });
        } else if (!!points[i].directionalDerivative) {
            var length = 0.2;
            if (!!points[i].arrowLength) {
                length = points[i].arrowLength;
            }
            drawDirectionalDerivative([points[i].x, points[i].y], points[i].direction, length, {
                fill: points[i].color,
                stroke: points[i].color
            });
        } else if (!!points[i].vector) {
            var length = 0.2;
            if (!!points[i].arrowLength) {
                length = points[i].arrowLength;
            }
            arrow(points[i].start, points[i].end, {
                fill: points[i].color,
                stroke: points[i].color
            });
        } else {
            paths.push({
                "vertices": [[points[i].x, points[i].y, f(points[i].x, points[i].y) + 0.02]],
                "radius": 0.02,
                "color": points[i].color,
                "point": true
            });
        }
    }
}

function addLine(start, end, style) {
    paths.push({
        "vertices": [start, end],
        "style": style
    });
}

function drawFrame() {
    // white axes
    var axisStyle = {
        stroke: "#000000",
        strokeWidth: 2
    };
    // Each line is broken into pieces so that whatever part of the line is behind the surface is drawn first and whatever part is in front is drawn later.
    for (var i = 0; i < occlusionAccuracy; i++) {
        // The axes are split into parts using linear interpolation. We add 1.1 to i for the end point instead of just 1 so that the lines appear seamless.
        addLine(
            [-axisLength + i/occlusionAccuracy * 2*axisLength, 0, 0],
            [-axisLength + (i + 1.1)/occlusionAccuracy * 2*axisLength, 0, 0],
            axisStyle
        );
        addLine(
            [0, -axisLength + i/occlusionAccuracy * 2*axisLength, 0],
            [0, -axisLength + (i + 1.1)/occlusionAccuracy * 2* axisLength, 0],
            axisStyle
        );
        addLine(
            [0, 0, -axisLength + i/occlusionAccuracy * 2*axisLength],
            [0, 0, -axisLength + (i + 1.1)/occlusionAccuracy * 2* axisLength],
            axisStyle
        );
    }
}

function drawBackground() {
    // axis names
    label(proj([axisLength*1.1, 0, 0]), "x", "center", true, {color: GREEN_E});
    label(proj([0, axisLength*1.1, 0]), "y", "center", true, {color: RED_E});
    label(proj([0, 0, axisLength*1.1]), "z", "center", true, {color: TEAL_E});
}

/***** main.js *****/

setup();

drawFrame();
drawSurface();
drawPoints();

drawBackground();
render();

/*************************************/

function setup() {
    var scales = _.map(range, function(extent) {
        return Perseus.Util.scaleFromExtent(extent, size);
    });
    init({range: range, scale: _.min(scales)});
}
    `;

    return globals + "\n\n\n" + everythingElse;
}

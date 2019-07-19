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
                strokeWidth: 0.2,
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
        stroke: "#F6F7F7",
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
    // black background
    style({
        fill: "#000000"
    });
    rect(-WIDTH, -WIDTH, 4*WIDTH, 4*WIDTH);
}

function drawLabels() {
    // axis names
    var xPos = scale(proj([axisLength*1.1, 0, 0]), WIDTH),
        yPos = scale(proj([0, axisLength*1.1, 0]), WIDTH),
        zPos = scale(proj([0, 0, axisLength*1.1]), WIDTH);

    if (!!xPos) {
        textSize(100 / magnitude(add([axisLength*1.1, 0, 0], scale(camera, -1))));
        style({ fill: "#8af281" });
        text("x", xPos[0], xPos[1], "center");
    }
    if (!!yPos) {
        textSize(100 / magnitude(add([0, axisLength*1.1, 0], scale(camera, -1))));
        style({ fill: "#ff8482" });
        text("y", yPos[0], yPos[1], "center");
    }
    if (!!zPos) {
        textSize(100 / magnitude(add([0, 0, axisLength*1.1], scale(camera, -1))));
        style({ fill: "#26edd5" });
        text("z", zPos[0], zPos[1], "center");
    }
}

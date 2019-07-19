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
        vertices.push(scale(projected, WIDTH));
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
    ellipse(vertices[0][0], vertices[0][1], p.radius, p.radius, {
        stroke: "none",
        fill: p.color
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

    drawLabels();
}

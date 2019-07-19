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
    return [rotated[0] / rotated[2] * zoom, rotated[1] / rotated[2] * zoom];
}

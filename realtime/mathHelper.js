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

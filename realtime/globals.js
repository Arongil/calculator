/* The X and Y ranges of this canvas */
var range = [[-1, 1], [-1, 1]];

// The number of steps used when drawing the surface. Bigger looks smoother but takes longer to compute. Recommended: 20.
var steps = 20;
// The length of the axes.
var axisLength = 1.2;
// The number of segments the axes are broken into.
var occlusionAccuracy = 100;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

var fElement = document.getElementById("function"),
    functionString = fElement.value,
    parametric = false;
eval("var f = (x, y) => { " + (functionString.indexOf("return") == -1 ? "return " + functionString : functionString) + " };");

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
var zoom = 1;

// position of the camera
var camera = [0, 0, 5];
// rotation of the camera, where the numbers in order mean rotation around the x, y, and z axes.
var rotation = [Math.PI, 0, -Math.PI/2];
// The unit-length direction that light travels (from the camera to the origin).
var lightUnitNormal = normalize(scale(camera, -1));
var lightStrength = 1;
// ambientLight is a number between zero and one that adds a universal brightness to surfaces.
var ambientLight = 0.0;

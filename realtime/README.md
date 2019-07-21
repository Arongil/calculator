# Realtime 3D Grapher

## How to Move

Click "Click Here to Start". Now you can use WASD to move back, forth, left, and right. Q moves you down, and E moves you up. Use the mouse to rotate your view.

## How to Graph

Write a function in the text box. You are free to fiddle with the lighting and graphing steps as you please.

There are two kinds of functions *Realtime* accepts: 2D scalar fields and parametric surfaces. Examples of each are listed below.

## Scalar Fields: Example Functions

### Bell Curve

```javascript
Math.exp(-(x*x+y*y)*6)
```

### Hilly Terrain

```javascript
(Math.sin(4*x) + Math.sin(4*y))/4 + (Math.sin(14*x) + Math.sin(19*y))/19
```

## Parametric Surfaces: Example Functions

### XZ Plane

```javascript
[x, 0.5, y]
```

### Torus

```javascript
var u = Math.PI*x, v = Math.PI*y, r1 = 0.6, r2 = 0.3;

return [(r1 + r2*Math.cos(v))*Math.cos(u), (r1 + r2*Math.cos(v))*Math.sin(u), r2*Math.sin(v)];
```

### Sphere

```javascript
var u = Math.PI*x, v = Math.PI/2*y, r = 1;

return [r * Math.cos(u)*Math.cos(v), r * Math.sin(u)*Math.cos(v), r * Math.sin(v)];
```

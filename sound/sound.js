var mic = new p5.AudioIn();
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var p5 = new p5();
var shushes = [
	p5.loadSound("audio/shush1.mp3"),
	p5.loadSound("audio/shush2.mp3"),
	p5.loadSound("audio/shush3.mp3"),
	p5.loadSound("audio/shush4.mp3")
];

var ctx = new Canvas("canvas");
ctx.resize();

var shusher = new Shusher(shushes, 0.008, 6);
// var meter = new SoundMeter(shusher, 0.02, 0.9, 0.02, 0.5, 3); // Khan Academy
// var meter = new SoundMeter(shusher, 0.02, 0.9, 0.03, 0.8, 3); // Goal Time
var meter = new SoundMeter(shusher, 0.02, 0.9, 0.04, 0.8, 3); // Break
// var meter = new SoundMeter(shusher, 0.02, 0.9, 0.05, 0.8, 3); // Lunch
meter.init();

function init() {
  mic.start();
  window.requestAnimationFrame(loop);
}

function loop() {
  meter.listen();
  meter.display();
  
  window.requestAnimationFrame(loop);
}

window.onload = init;

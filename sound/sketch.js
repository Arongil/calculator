var mic = new p5.AudioIn();
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

mic.start();

class Shusher {
	
	constructor(shushes, warnings, tolerance = 0.1, exponent = 5, warningChance = 0.2, warningTimeout = 60 * 1000) {
		this.shushes = shushes;
		this.warnings = warnings;
		this.shushing = false;
		this.warning = false;
		// Tolerance is a positive number that scales the chance to shush.
		this.tolerance = tolerance;
		// Exponent is a positive number describing how the meter affects the chance to shush.
		this.exponent = exponent;
		// The chance that a warning occurs.
		this.warningChance = warningChance;
		// The minimum time between warnings.
		this.warningTimeout = warningTimeout;
		this.lastWarning = 0;
	}
	
	isPlaying() {
		return this.warning || this.shushing;
	}
	
	shush() {
		var audio = this.shushes[ Math.floor(Math.random() * this.shushes.length) ];
		// .play parameters, all optional: [startTime], [rate], [amp], [cueStart], [duration].
		audio.play(0, 1, 1);
		this.shushing = true;
		window.setTimeout((() => this.shushing = false).bind(this), audio.duration() * 1000);
	}
	
	warn() {
		var audio = this.warnings[ Math.floor(Math.random() * this.warnings.length) ];
		// .play parameters, all optional: [startTime], [rate], [amp], [cueStart], [duration].
		audio.play(0, 1, 2); // Play warnings twice as loudly.
		this.warning = true;
		window.setTimeout((() => this.warning = false).bind(this), audio.duration() * 1000);
	}
	
	tryWarn() {
		if (Math.random() < this.warningChance && Date.now() > this.lastWarning + this.warningTimeout) {
			this.warn();
			this.lastWarning = Date.now();
			return true;
		}
		return false;
	}
	
	tryShush(meter) {
		if (Math.random() < this.tolerance * Math.pow(meter, this.exponent)) {
			this.shush();
			return true;
		}
		return false;
	}
}

class SoundMeter {
	
	constructor(shusher, sensitivity = 0.2, friction = 0.9, ambience = 0.02, shift = 0.5, bars = 3) {
		this.shusher = shusher;
		// The final measure of loudness, not the frame-by-frame mic input.
		this.meter = 0;
		this.velocity = 0;
		// Number between zero, unresponsive, and one, infinitely responsive.
		this.sensitivity = Math.tan(sensitivity / (Math.PI/2) );
		// Friction is like the inertia of the volume meter:
		// how much and how quickly changes in volume affect it.
		this.friction = friction;
		// Ambience is the normal, expected volume level. Environments louder
		// than it increase the meter and environments softer than it decrease the meter.
		this.ambience = ambience;
		// Shift is the amount higher ambience needs to be for the bars to increase
		// based on the current volume. Loud environments should need louder noises to
		// sustain them than quieter environments.
		this.shift = shift;
		
		this.bars = bars;
		this.barsYFraction = 0.8; // Percentage of the screen displaying the bars.
		this.graphYFraction = 0.2; // Percentage of the screen displaying the graph.
		// The list of colors between which bars will interpolate.
		this.colorPoints = [
			{"r": 0, "g": 255, "b": 0},
			{"r": 255, "g": 255, "b": 0},		
			{"r": 255, "g": 0, "b": 0}
		];
		// Bezier interpolation will transition smoothly between colors.
		this.barColors = [];
		
		this.graphInitialized = false;
		this.timestamps = 12; // number of timestamps drawn on to the graph
		this.subticks = 1; // the number of sub-timestamps per timestamp
		this.timestampYFraction = 0.2; // percentage of the graph slot that displays timestamps
		this.startTime = 8 * 60 * 60; // the time in seconds at which the graph begins
		this.endTime = 20 * 60 * 60; // the time in seconds at which the graph ends
		this.recordInterval = 60 * 1000; // milliseconds between plotting on the graph
		this.records = 0;
		this.graphY = 0;
		// When a new datum is recorded on the graph, it is placed at the position
		// defined by oldPos*smoothFactor + newPos*(1 - smoothFactor).
		this.smoothness = 0.5;
	}
	
	setSensitivity(sensitivity) {
		this.sensitivity = Math.tan(sensitivity / (Math.PI/2) );
	}
	setAmbience(ambience) {
		this.ambience = ambience;
	}
	setShift(shift) {
		this.shift = shift;
	}
	
	initBarColors() {
		this.barColors = [];
		for (var i = 0, n = this.colorPoints.length, j, interpolation, color; i < this.bars; i++) {
			interpolation = i / (this.bars - 1);
			color = {"r": 0, "g": 0, "b": 0};
			// Perform bezier interpolation between color markers.
			for (j = 0; j < n; j++) {
				color = {
					"r": color.r + this.colorPoints[j].r * binomial(n-1, j) * Math.pow(1 - interpolation, n-1 - j) * Math.pow(interpolation, j),
					"g": color.g + this.colorPoints[j].g * binomial(n-1, j) * Math.pow(1 - interpolation, n-1 - j) * Math.pow(interpolation, j),
					"b": color.b + this.colorPoints[j].b * binomial(n-1, j) * Math.pow(1 - interpolation, n-1 - j) * Math.pow(interpolation, j)
				};
			}
			// Push the color but twice as bright.
			this.barColors.push({"r": 2*color.r, "g": 2*color.g, "b": 2*color.b});
		}
	}
	
	init() {
		this.initBarColors();
	}
	
	listen() {
		if (!this.shusher.isPlaying())
			this.velocity += (mic.getLevel() - this.ambience*(1 - this.shift + this.shift*this.meter)) * this.sensitivity;
		this.velocity *= this.friction;
		this.meter += this.velocity;
		
		if (this.meter < 0) {
			this.meter = 0;
			this.velocity = 1 * Math.abs(this.velocity); // Add in a little bounce for fun. Absolute value it to ensure it goes up.
		}
		if (this.meter > 1) {
			this.meter = 1;
			this.velocity = -0.2 * Math.abs(this.velocity); // Add in a little bounce for fun. Absolute value it to ensure it goes down.
			// Warn that it's too loud.
			if (this.shusher.isPlaying()) {
				this.shusher.warning = true; // Tell the shusher to not shush until the warning happens.
				// Assume that maximum shush length is 5 seconds and that the space won't get quiet in that time.
				window.setTimeout((() => {
					if (!this.shusher.tryWarn()) // If the shusher decides not to warn, still reset the warning setting.
						this.shusher.warning = false;
				}).bind(this), 5 * 1000);
			}
			else {
				this.shusher.tryWarn();
			}
		}
		
		if (!this.shusher.isPlaying())
			this.shusher.tryShush(this.meter);
	}
	
	displayBars() {
		noStroke();
		fill(0, 0, 0);
		rect(-WIDTH/2, -HEIGHT/2, WIDTH, HEIGHT * this.barsYFraction);
		
		var interpolation, color, height, i;
		for (i = 0; i < this.bars; i++) {
			interpolation = i / this.bars;
			color = this.barColors[i];
			if (interpolation >= this.meter) // If meter hasn't even reached the bar, set its height to 0.
				height = 0;
			else if (interpolation + 1 / this.bars <= this.meter) // If meter has passed the bar, set its height to 1.
				height = 1;
			else // If meter is upon the bar, set its height accordingly.
				height = this.meter % (1 / this.bars) * this.bars;
			noStroke();
			fill(color.r, color.g, color.b);
			rect(-WIDTH/2 + WIDTH * interpolation, -HEIGHT/2 + HEIGHT * this.barsYFraction, WIDTH / this.bars, -HEIGHT * this.barsYFraction * height);
		}
	}
	
	initGraph() {
		// Draw the black background.
		noStroke();
		fill(0, 0, 0);
		rect(-WIDTH/2, HEIGHT/2, WIDTH, -HEIGHT * (1 - this.barsYFraction));
		
		// Draw the timestamps and their corresponding line markers.
		var centeringFraction = 0.9, textSizeCoefficient = 0.8 * centeringFraction, percentage, minute, hour, i, j;
		for (i = 0; i < this.timestamps; i++) {
			// Stretch the percentage according to the start and end times for the time calculation.
			percentage = (i / this.timestamps * (this.endTime - this.startTime) + this.startTime)/86400;
			minute = Math.round(60*24 * percentage) % 60;
			hour = Math.round(24 * percentage) % 12;
			if (hour == 0) hour = 12;
			// Recalibrate the percentage to be between 0 and 1 for the display.
			percentage = (percentage - this.startTime/86400) * 86400/(this.endTime - this.startTime);
			noStroke();
			fill(255, 255, 0);
			textSize(HEIGHT * this.graphYFraction * this.timestampYFraction * textSizeCoefficient);
			text(hour + ":" + (minute < 10 ? "0" : "") + minute,
				   -WIDTH/2 + (percentage + (1 - centeringFraction)/this.timestamps) * WIDTH,
					 HEIGHT/2 - HEIGHT * this.graphYFraction * this.timestampYFraction * textSizeCoefficient / 2);
			stroke(255, 255, 0);
			line(-WIDTH/2 + percentage * WIDTH, HEIGHT/2,
					 -WIDTH/2 + percentage * WIDTH, HEIGHT/2 - HEIGHT * this.graphYFraction * this.timestampYFraction);
			for (j = 1; j <= this.subticks; j++) {
				line(-WIDTH/2 + (percentage + j / (this.subticks + 1) / this.timestamps) * WIDTH,
						 HEIGHT/2 - HEIGHT * this.graphYFraction * this.timestampYFraction * (0.8 + textSizeCoefficient/5),
					   -WIDTH/2 + (percentage + j / (this.subticks + 1) / this.timestamps) * WIDTH,
						 HEIGHT/2 - HEIGHT * this.graphYFraction * this.timestampYFraction);
			}
		}
	}
	
	displayGraph() {
		if (!this.graphInitialized) {
			this.graphInitialized = true;
			this.initGraph();
		}
		
		if (window.performance.now() > this.records*this.recordInterval) {
			this.records++;
			var percentage = getSeconds() / 86400;
			// Recalibrate the percentage to be between 0 and 1 for the display.
			percentage = (percentage - this.startTime/86400) * 86400/(this.endTime - this.startTime);
			this.graphY = this.graphY * this.smoothness + this.meter * (1 - this.smoothness);
			noStroke();
			fill(0, 255, 0);
			rect(-WIDTH/2 + WIDTH*percentage, HEIGHT/2 - HEIGHT*this.graphYFraction*this.timestampYFraction,
					 this.recordInterval/(this.endTime - this.startTime), -HEIGHT*this.graphYFraction*(1 - this.timestampYFraction)*this.graphY);
		}
	}
	
	display() {
		this.displayBars();
		this.displayGraph();
	}
	
}

function getSeconds() {
	var date = new Date(), hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();
	return hour*3600 + minute*60 + second;
}

function factorial(n) {
	var product = 1, i;
	for (i = 2; i <= n; i++) {
		product *= i;
	}
	return product;
}
function binomial(n, k) {
	return factorial(n) / (factorial(k) * factorial(n - k));
}

function setup() {
	createCanvas(WIDTH, HEIGHT);
}

function getUrlKeyword(keyword) {
	var url = window.location.href, keyword, index, substr;
	if (url.indexOf(keyword + "=") == -1 || url.indexOf("?") == -1) {
		return "default";
	}
	else {
		index = url.indexOf(keyword + "=");
		substr = url.slice(index);
		return substr.slice(substr.indexOf("=") + 1, substr.indexOf("&") != -1 ? substr.indexOf("&") : substr.length);
	}
}

var meter, shusher;

var shushers = {
	"default": new Shusher(shushes, warnings, 0.01, 6, 0.2, 60 * 1000),
	"null": new Shusher(shushes, warnings, 0.0, 6, 0, 60 * 1000),
	"active": new Shusher(shushes, warnings, 0.02, 5, 0.5, 60 * 1000),
	"apathetic": new Shusher(shushes, warnings, 0.005, 8, 0.1, 60 * 1000),
	"hyper": new Shusher(shushes, warnings, 0.2, 3, 1, 60 * 1000)
};
var shusherType = getUrlKeyword("shusher");
shusher = shushers[shusherType];
shusher.warningChance = 0;

var meters = {
	"default": new SoundMeter(shusher, 0.02, 0.9, 0.05, 0.8, 3),
	"null": new SoundMeter(shusher, 0.0, 0.9, 0.04, 0.5, 3),
	"active": new SoundMeter(shusher, 0.03, 0.9, 0.03, 0.8, 3),
	"apathetic": new SoundMeter(shusher, 0.02, 0.8, 0.06, 0.8, 3),
	"slick": new SoundMeter(shusher, 0.04, 0.95, 0.04, 0.8, 3),
	"dull": new SoundMeter(shusher, 0.01, 0.7, 0.06, 0.6, 3),
	"hyper": new SoundMeter(shusher, 0.05, 0.9, 0.022, 0.8, 3)
}
var meterType = getUrlKeyword("meter");
meter = meters[meterType];
var sensitivity = getUrlKeyword("sensitivity");
if (sensitivity !== "default") {
	meter.setSensitivity(parseFloat(sensitivity));
}
var ambience = getUrlKeyword("ambience");
if (ambience !== "default") {
	meter.setAmbience(parseFloat(ambience));
}
var shift = getUrlKeyword("shift");
if (shift !== "default") {
	meter.setShift(parseFloat(shift));
}

var recordInterval = getUrlKeyword("recordInterval");
if (recordInterval !== "default") {
	meter.recordInterval = recordInterval * 1000;
}

meter.init();

var specialTimes = [
	// Meetings and their bell rings
	// { // 10:30 - 10:30 and 1 second: morning meeting => ring bell
	// 	"start": 37800,
	// 	"end": 37800 + 1,
	// 	"happening": false,
	// 	"startAction": () => bells[Math.floor(Math.random() * bells.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// },
	// { // 10:30 - 10:45: morning meeting => disable shusher
	// 	"start": 37800,
	// 	"end": 38700,
	// 	"happening": false,
	// 	"startAction": () => meter.shusher = shushers["null"],
	// 	"endAction": () => meter.shusher = shushers["apathetic"]
	// },
	// { // 11:00 - 11:00 and 1 second: break over => normal shusher
	// 	"start": 37800,
	// 	"end": 38700 + 1,
	// 	"happening": false,
	// 	"startAction": () => meter.shusher = shushers[shusherType],
	// 	"endAction": () => null
	// },
	// { // 3:45 - 3:45 and 1 second: morning meeting => ring bell
	// 	"start": 56700,
	// 	"end": 56700 + 1,
	// 	"happening": false,
	// 	"startAction": () => bells[Math.floor(Math.random() * bells.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// },
	// { // 3:45 - 4:00: closing meeting => disable shusher
	// 	"start": 56700,
	// 	"end": 57600,
	// 	"happening": false,
	// 	"startAction": () => meter.shusher = shushers["null"],
	// 	"endAction": () => meter.shusher = shushers[shusherType]
	// },
	// Class times and their reminders
	// { // 9:00: class time => reminder
	// 	"start": 32400,
	// 	"end": 32400 + 1,
	// 	"happening": false,
	// 	"startAction": () => classtimes[Math.floor(Math.random() * classtimes.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// },
	// { // 9:45: class time => reminder
	// 	"start": 35100,
	// 	"end": 35100 + 1,
	// 	"happening": false,
	// 	"startAction": () => classtimes[Math.floor(Math.random() * classtimes.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// },
	// { // 11:00: class time => reminder
	// 	"start": 39600,
	// 	"end": 39600 + 1,
	// 	"happening": false,
	// 	"startAction": () => classtimes[Math.floor(Math.random() * classtimes.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// },
	// { // 11:45: class time => reminder
	// 	"start": 42300,
	// 	"end": 42300 + 1,
	// 	"happening": false,
	// 	"startAction": () => classtimes[Math.floor(Math.random() * classtimes.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// },
	// { // 1:15: class time => reminder
	// 	"start": 47700,
	// 	"end": 47700 + 1,
	// 	"happening": false,
	// 	"startAction": () => classtimes[Math.floor(Math.random() * classtimes.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// },
	// { // 2:00: class time => reminder
	// 	"start": 50400,
	// 	"end": 50400 + 1,
	// 	"happening": false,
	// 	"startAction": () => classtimes[Math.floor(Math.random() * classtimes.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// },
	// { // 2:45: class time => reminder
	// 	"start": 53100,
	// 	"end": 53100 + 1,
	// 	"happening": false,
	// 	"startAction": () => classtimes[Math.floor(Math.random() * classtimes.length)].play(0, 1, 1),
	// 	"endAction": () => null
	// }
];

function checkSpecialTimes() {
	for (var i = 0, time; i < specialTimes.length; i++) {
		time = specialTimes[i];
		if (getSeconds() >= time.start && getSeconds() <= time.end && !time.happening) {
			time.startAction();
			time.happening = true;
		}
		else if (getSeconds() > time.end && time.happening) {
			time.endAction();
			time.happening = false;
		}
	}
}

function mouseReleased() {
	// Shush on click.
	meter.shusher.shush();
}

function draw() {
	translate(WIDTH/2, HEIGHT/2);
	
	checkSpecialTimes();
	
	meter.listen();
	meter.display();
}

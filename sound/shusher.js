class Shusher {
	
	constructor(shushes, tolerance = 0.1, exponent = 5) {
		this.shushes = shushes;
		this.shushing = false;
		// Tolerance is a positive number that scales the chance to shush.
		this.tolerance = tolerance;
		// Exponent is a positive number describing how the meter affects the chance to shush.
		this.exponent = exponent;
	}
	
	shush() {
		var audio = this.shushes[ Math.floor(Math.random() * this.shushes.length) ];
		// .play parameters, all optional: [startTime], [rate], [amp], [cueStart], [duration].
		audio.play(0, 1, 1);
		this.shushing = true;
		window.setTimeout((() => this.shushing = false).bind(this), audio.duration() * 1000);
	}
	
	update(meter) {
		if (Math.random() < this.tolerance * Math.pow(meter, this.exponent)) {
			this.shush();
		}
	}
}

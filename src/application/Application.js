/*
 * Application serves as a global point of reference for the application,
 * as well as containing the main driver code. Most of the main loop code is
 * from the tutorial: https://developer.mozilla.org/en-US/docs/Games/Anatomy
 *
*/
class Application {

	constructor(config, model, view, controller) {
		this.initConfig(config);
		this._coordinator = new Coordinator(this, model, view, controller);
		this._playing = false;
		/* below should be config vars? */
		this._lastTickFrame = performance.now();
		this._lastRenderedFrame = this._lastTick; // Pretend the first draw was on first update.
		this._framesPerTick = 50; // This sets your simulation to run at 20Hz (50ms)
	}

	initConfig(config) {
		this.config = config;
	}

	get name() {
		return this.config.applicationName;
	}

	_mainLoop(currentFrame) {
		if (!this._playing) return;
		this._loopId = window.requestAnimationFrame(
			this._mainLoop.bind(this)
		);
		let nextTickFrame = this._lastTickFrame + this._framesPerTick;
		let ticksElapsed = 0;
		if (currentFrame >= nextTickFrame) {
			let framesSinceLastTick = currentFrame - this._lastTickFrame;
			ticksElapsed = Math.floor(framesSinceLastTick / this._framesPerTick);
		}
		this._coordinator.processInputs();
		this._queueUpdates(ticksElapsed); // updates the last tick frame
		this._coordinator.renderUI(currentFrame);
		this._lastRenderedFrame = currentFrame;
	}

	_queueUpdates(numTicks) {
		for (let i = 0; i < numTicks; i++) {
			this._lastTickFrame += this._framesPerTick;
			this._coordinator.processUpdates(this._lastTickFrame);
		}
	}

	run() {
		console.log(`${this.name} running!`);
		this._playing = true;
		this._mainLoop(window.performance.now());
	}

}
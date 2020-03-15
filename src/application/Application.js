/*
 * Application serves as a global point of reference for the application,
 * as well as containing the main driver code. 
 *
*/
class Application {

	constructor(config, model, view, controller) {
		this.initConfig(config);
		this._coordinator = new Coordinator(this, model, view, controller);
	}

	initConfig(config) {
		this.config = config;
	}

	get name() {
		return this.config.applicationName;
	}

	run() {
		// TODO: Implement
		console.log(`${this.name} running!`);
		this._coordinator.renderUI();
	}

}
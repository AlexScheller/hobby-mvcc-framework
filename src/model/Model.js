class Model {

	constructor(params) {
		this.params = params;
		this._handledInputs = [];
		this._handledEvents = [];
	}

	init(coordinator, params = null) {
		this._coordinator = coordinator;
		if (params == null) {
			this._load(this.params);			
		}
		this._coordinator.registerInputsListener(this._handledInputs, this);
		this._coordinator.registerEventsListener(this._handledEvents, this);
	}

	// [Extended, Overridden]
	handleInput(input, data) {

	}

	// [Extended, Overridden]
	handleEvent(event, data) {

	}

	// [Overrideable]
	_load(params) {
		this._coordinator.newEvent(this.constructor.name, 'debug', {
			'message': 'loading'
		});
		// Here's where the extending model makes calls to the database or
		// reads values from a file or even simply declares the data directly.
	}

	// [Overrideable]
	update(tick) {

	}

}
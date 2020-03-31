class Model {

	constructor(params) {
		this.params = params;
		this._handledInputs = [];
		this._handledEvents = [];
		this._ticksElapsed = 0;
		this._stateHash = '';
	}

	toString() {
		return `<Model {${this.constructor.name}}>`
	}

	get stateHash() {
		return this._stateHash;
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

	// Must be overridden by implementing class if this is to be of any actual
	// use. 
	_calculateStateHash() {
		this._stateHash = this._ticksElapsed;
	}

	// [Overrideable]
	update(tick) {
		this._ticksElapsed = tick;
		this._update(tick);
		this._calculateStateHash();
	}

}
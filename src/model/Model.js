class Model {

	constructor(params) {
		this.params = params;
	}

	init(coordinator, params = null) {
		this._coordinator = coordinator;
		if (params == null) {
			this._load(this.params);			
		}
	}

	// [Overrideable]
	_load(params) {
		this._coordinator.newEvent(this.constructor.name, 'debug', {
			'message': 'loading'
		});
		// Here's where the extending model makes calls to the database or
		// reads values from a file or even simply declares the data directly.
	}

}
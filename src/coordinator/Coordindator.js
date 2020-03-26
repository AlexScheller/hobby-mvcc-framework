/*
 * Whereas Application serves as the progress driver, Coordinator servers
 * (as the name would imply) the coordination point between the top-level
 * application components.
 *
 * Note that Coordinator, along with Application, is *not* meant to be a
 * generic class extended by the framework user.
 *
*/
class Coordinator {

	// In the future this should take multiples of each param.
	constructor(application, model, rootUI, controller) {
		this._application = application;
		this._inputListeners = new Map();
		this._eventListeners = new Map();
		this._rootUI = rootUI;
		this._rootUI.init(this);
		this._model = model;
		this._model.init(this);
		this._controller = controller;
		this._controller.init(this)
		// Currently these are just arrays, but may need to be classes with
		// more functionality in the future.
		this._inputQueue = [];
		this._eventQueue = [];
	}

	// TODO: Explain the distinction between inputs and events
	/* Input and internal event listeners */

	registerInputListener(input, listener) {
		if (this._application.config.debug) {
			console.log(`registering listener: ${listener.toString()} for input: ${input}`);
		}
		if (this._inputListeners.has(input)) {
			this._inputListeners.get(input).push(listener);			
		} else {
			this._inputListeners.set(input, [listener]);
		}
	}

	registerInputsListener(inputs, listener) {
		for (let input of inputs) {
			this.registerInputListener(input, listener);
		}
	}

	registerEventListener(event, listener) {
		if (this._eventListeners.has(event)) {
			this._eventListeners.get(event).push(listener);			
		} else {
			this._eventListeners.set(event, [listener]);
		}
	}

	registerEventsListener(events, listener) {
		for (let event of events) {
			this.registerEventListener(event, listener);
		}
	}

	/* Access/Bookkeeping */
	getUIInputContext() {
		if (this._rootUI != null) {
			return this._rootUI.inputContext;
		}
		return null;
	}

	/* Driver functions, called by the application */

	renderUI() {
		this._rootUI.render(this._model);
	}

	// This is only called internally, and only on events that have already
	// been checked for the existence of a valid mapping.
	_dispatchInput(input) {
		if (this._inputListeners.has(input.name)) {
			for (let listener of this._inputListeners.get(input.name)) {
				console.log(input.data);
				listener.handleInput(input.name, input.data);
			}
		}
	}

	processInputs() {
		while (this._inputQueue.length > 0) { 
			this._dispatchInput(this._inputQueue.shift());
		}
	}

	// This is only called internally, and only on events that have already
	// been checked for the existence of a valid mapping.
	_dispatchEvent(event) {
		if (this._eventListeners.has(event.name)) {
			for (let listener of this._eventListeners.get(event.name)) {
				listener.handleEvent(event.name, event.data);
			}
		}
	}

	// In the future this will be limited by a number of frames maybe?
	// for now it just empties the queue.
	processUpdates(tick) {
		while (this._eventQueue.length > 0) {
			this._dispatchEvent(this._eventQueue.shift());
		}
		this._model.update(tick);
	}

	/* Event reception and dispatching */

	// TODO: Have this save to storage of some kind.
	_logInput(event) {
		if (this._application.config.debug) {
			if (this._inputListeners.has(event.type)) {
				console.log(`input: ${event.source} > ${event.type}`);
			} else {
				console.log(`input (UNHANDLED): ${event.source} > ${event.type}`);
			}
		}
	}

	_logEvent(event) {
		if (this._application.config.debug) {
			if (this._eventListeners.has(event.type)) {
				console.log(`event: ${event.source} > ${event.type}`);
			} else {
				console.log(`event (UNHANDLED): ${event.source} > ${event.type}`);
			}
		}
	}

	newInput(source, type, input) {
		this._logInput({ source, type: type });
		if (this._inputListeners.has(type)) {
			this._inputQueue.push({
				name: type,
				data: input
			});
		}
	}

	newEvent(source, type, event) {
		this._logEvent({ source, type });
		if (this._eventListeners.has(type)) {
			this._eventQueue.push({
				name: type,
				data: event
			});
		}
	}

}
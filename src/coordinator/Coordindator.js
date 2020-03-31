class EventQueue {

	constructor() {
		this.events = [];
	}

	enqueue(event) {

	}

	dequeue() {

	}

}

/*
 * Whereas `Application` serves as the progress driver, Coordinator serves
 * (as the name would imply) as the coordination point between the top-level
 * application components.
 *
 * Note that Coordinator, along with Application, is *not* meant to be a
 * generic class extended by the framework user, in fact, unlike Application,
 * Coordinator is totally internal to the framework.
 *
*/
class Coordinator {

	// In the future this should take multiples of each param.
	constructor(application, model, rootUI, controller) {
		this._application = application;

		// A registry of objects that listen for inputs and general events.
		// Inputs and events don't much differ in composition, but conceptually
		// inputs are only to be issued from a controller, whereas events may
		// arise from any of the major component objects.
		this._inputListeners = new Map();
		this._eventListeners = new Map();

		// Currently these are just arrays, but may need to be classes with
		// more functionality in the future.
		this._inputQueue = [];
		this._eventQueue = [];

		// The the major component objects are added and initialized.
		this._rootUI = rootUI;
		this._rootUI.init(this);

		this._model = model;
		this._model.init(this);

		this._controller = controller;
		this._controller.init(this)
	}

	/* Input and internal event listeners */

	// Multiple inputs
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

	// Single input
	registerInputsListener(inputs, listener) {
		for (let input of inputs) {
			this.registerInputListener(input, listener);
		}
	}

	// Multiple events
	registerEventListener(event, listener) {
		if (this._application.config.debug) {
			console.log(`registering listener: ${listener.toString()} for event: ${event}`);
		}
		if (this._eventListeners.has(event)) {
			this._eventListeners.get(event).push(listener);			
		} else {
			this._eventListeners.set(event, [listener]);
		}
	}

	// Single event
	registerEventsListener(events, listener) {
		for (let event of events) {
			this.registerEventListener(event, listener);
		}
	}

	/* Access/Bookkeeping */

	// TODO: This is kind of a wart. The issue is that real inputs come from
	// the browser, but the controller is the framework's point of reference
	// for (virtual) inputs. Somehow the controller needs to have real inputs
	// passed to it so that it can issue virtual inputs.
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
		if (this._inputListeners.has(input.type)) {
			for (let listener of this._inputListeners.get(input.type)) {
				listener.handleInput(input);
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
		if (this._eventListeners.has(event.type)) {
			for (let listener of this._eventListeners.get(event.type)) {
				listener.handleEvent(event);
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
	_logInput(input) {
		if (this._inputListeners.has(input.type)) {
			console.log(`input: ${input.source} > ${input.type}`);
		} else {
			console.log(`input (UNHANDLED): ${input.source} > ${input.type}`);
		}
	}

	// TODO: Have this save to storage of some kind.
	_logEvent(event) {
		if (this._eventListeners.has(event.type)) {
			console.log(`event: ${event.source} > ${event.type}`);
		} else {
			console.log(`event (UNHANDLED): ${event.source} > ${event.type}`);
		}
	}

	newInput(input) {
		if (this._application.config.debug) {
			this._logInput(input);
		}
		if (this._inputListeners.has(input.type)) {
			this._inputQueue.push({
				type: input.type,
				data: input.data
			});
		}
	}

	newEvent(event) {
		if (this._application.config.debug) {
			this._logEvent(event);
		}
		if (this._eventListeners.has(event.type)) {
			this._eventQueue.push({
				type: event.type,
				data: event.data
			});
		}
	}

}
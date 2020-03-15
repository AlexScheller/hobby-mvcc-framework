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
		this._rootUI = rootUI;
		this._rootUI.init(this);
		this._model = model;
		this._model.init(this);
		this._controller = controller;
		this._controller.init(this)
		// Currently these are just arrays, but may need to be classes with
		// more functionality in the future.
		this._inputQueue = [];
		this._updateQueue = [];
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

	processInputs() {
		while (this._inputQueue.length > 0) { 
			this._dispatchInputEvent(this._inputQueue.shift());
		}
	}

	// In the future this will be limited by a number of frames maybe?
	// for now it just empties the queue.
	processUpdates() {
		while (this._updateQueue.length > 0) { 
			this._dispatchUpdateEvent(this._updateQueue.shift());
		}
	}

	/* Event reception and dispatching */

	// TODO: Have this save to storage of some kind.
	// TODO: Separate logging from other input event types?
	_logEvent(event) {
		if (this._application.config.debug) {
			console.log(`event: ${event.source} > ${event.type}`);
		}
	}

	// Called by the top-level application components.
	// TODO: make the actual dispatching of inputs generic. Have some system
	// where instead of a hard coded switch/if-else, event sources can
	// register themselves with the controller and provide their event types.
	// Dispatching can then be done off of a map or something.

	// Yeah what's going on here (and below) is a BIG no-no. The coordinator
	// class should be totally generic. Right now it's handling events that are
	// specific to the example application. This is for development
	// bootstrapping purposes, but should absolutely be the next thing handled.
	newEvent(source, type, data) {
		this._logEvent({ source, type, data });
		switch (type) {
			case 'point-signal':
				this._inputQueue.push({ source, type, data });
				break;
			case 'grid-hex-activated':
			case 'hex-tool-activated':
				this._updateQueue.push({ source, type, data });
				break;
			case 'render':
				break;
			default:
				// TODO: Log this instead?
				console.warn(`Controller received unandled event: ${type}`);
		}
	}

	_dispatchInputEvent(event) {
		switch(event.type) {
			case 'point-signal':
				this._rootUI.handlePointSignal(event.data);
				break;
			default:
				console.error(
					`Controller cannot dispatch unhandled input: ${event.type}`
				);
		}
	}

	_dispatchUpdateEvent(event) {
		switch(event.type) {
			case 'grid-hex-activated':
				this._model.handleHexActivated(event.data);
				break;
			case 'hex-tool-activated':
				this._model.handleHexToolActivated(event.data);
				break;
			default:
				console.error(
					`Controller cannot dispatch unhandled update: ${event.type}`
				);
		}
	}

}
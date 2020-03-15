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
	}

	/* Access/Bookkeeping */
	getUIInputContext() {
		if (this._rootUI != null) {
			return this._rootUI.inputContext;
		}
		return null;
	}

	/* Driver functions */
	renderUI() {
		this._rootUI.render(this._model);
	}

	/* Event reception and dispatching */

	// TODO: Have this save to storage of some kind.
	_logEvent(event) {
		if (this._application.config.debug) {
			console.log(`event: ${event.source} > ${event.type}`);
			console.log(event.data);
		}
	}

	// Called by the top-level application components.
	newEvent(source, eventType, eventData) {
		this._logEvent({
			source,
			type: eventType,
			data: eventData
		});
		// TODO, actually implement something instead of this minimal example.
		if (eventType === 'point-signal') {
			if (this._ui != null) {
				this._ui.handlePointSignal(eventData);
			}
		}
	}

}
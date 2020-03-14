/*
 * Note that Coordinator, along with Application, is *not* meant to be a
 * generic class extended by the framework user.
 *
*/
class Coordinator {

	constructor() {
		this._
	}

	registerDestination(destination) {

	}

	// TODO: Have this save to storage of some kind.
	_logEvent(event) {
		console.log(event);
	}

	newEvent(source, eventType, eventData) {
		this._logEvent({
			source,
			type: eventType,
			data: eventType
		});
		// TODO, actually implement something instead of this minimal example.
		if (eventType === 'point-signal') {
			if (this._ui != null) {
				this._ui.handlePointSignal(eventData);
			}
		}
	}

}
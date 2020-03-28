/*
 * Controllers in the framework essentially server to receive raw/real input
 * events from the browser, and convert them into virtual framework friendly
 * input events. Generally there should be a single controller for each source
 * of raw input, e.g. one MouseController, one KeyboardController, etc. that
 * you need for your application.
 *
*/

/*
 * JS doesn't have interfaces but controllers are a perfect use case for them
 * for polymorphism purposes. This is a small hacked together "Interface" that
 * just checks that certain method names exist in extending classes.
 *
*/
class IController {

	constructor() {
		function complainAboutUnimplemented(method = 'unknown') {
			console.error(`Method: ${method} is unimplemented!`)
		}
		if (typeof this.setCoordinator !== 'function') {
			complainAboutUnimplemented('setCoordinator');
		}
		if (typeof this.setRawInputContext !== 'function') {
			complainAboutUnimplemented('setRawInputContext');
		}
		if (typeof this.init !== 'function') {
			complainAboutUnimplemented('init');
		}
		if (typeof this._setupInputListeners !== 'function') {
			complainAboutUnimplemented('_setupInputListeners');
		}
		if (typeof this._handleInputEvent !== 'function') {
			complainAboutUnimplemented('_handleInputEvent');
		}
	}

}

// Some non-generic standard controllers.
class MouseController extends IController {

	constructor() {
		super();
	}

	setCoordinator(coordinator) {
		this._coordinator = coordinator;
	}

	// Get the actual source of input.
	setRawInputContext(context) {
		this._rawInputContext = context;
	}

	init(coordinator) {
		this.setCoordinator(coordinator);
		this.setRawInputContext(this._coordinator.getUIInputContext());
		this._setupInputListeners();
	}

	_setupInputListeners() {
		if (this._rawInputContext != null) {
			this._rawInputContext.addEventListener('click', event => {
				this._handleInputEvent(event);
			});
		}
	}

	_handleInputEvent(event) {
		let point = {x: event.offsetX, y: event.offsetY};
		this._coordinator.newInput({
			source: this.constructor.name,
			type:'point-signal',
			data: point
		});
	}

}
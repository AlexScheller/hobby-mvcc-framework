class IController {

	constructor() {
		function complainAboutUnimplemented(method = 'unknown') {
			console.error(`Method: ${method} is unimplemented!`)
		}
		if (typeof this.setCoordinator !== 'function') {
			complainAboutUnimplemented('setCoordinator');
		}
		if (typeof this.setInputContext !== 'function') {
			complainAboutUnimplemented('setCoordinator');
		}
		if (typeof this.init !== 'function') {
			complainAboutUnimplemented('setCoordinator');
		}
		if (typeof this._setupInputListeners !== 'function') {
			complainAboutUnimplemented('_setupInputListeners');
		}
		if (typeof this._handleInputEvent !== 'function') {
			complainAboutUnimplemented('_handleInputEvent');
		}
	}

}

// Some non-generic standard controllers
class MouseController extends IController {

	constructor() {
		super();
	}

	setCoordinator(coordinator) {
		this._coordinator = coordinator;
	}

	setInputContext(context) {
		this._inputContext = context;
	}

	init(coordinator) {
		this.setCoordinator(coordinator);
		this.setInputContext(this._coordinator.getUIInputContext());
		this._setupInputListeners();
	}

	_setupInputListeners() {
		if (this._inputContext != null) {
			this._inputContext.addEventListener('click', event => {
				this._handleInputEvent(event);
			});
		}
	}

	_handleInputEvent(event) {
		let point = {x: event.offsetX, y: event.offsetY};
		this._coordinator.newEvent(this.constructor.name, 'point-signal', point);
	}

}
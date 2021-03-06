/*
 * The basic UI element. A UI Element isn't the lowest level code for handling
 * the rendering of images/shapes/text/etc., but it IS the lowest level code
 * in the framework for _generic_ handling of positioning, higher level
 * rendering calls, input events, etc. As an example, when implementing a chess
 * board, the board itself would likely extend UIFrame, and the individual
 * squares might extend UIElement, but the pieces are likely to only be
 * images or shapes, with rendering handled by the squares.
 *
 * TODOS:
 *   - Right now all UIElements are rectangles. Consider handling of other
 *     shapes.
 *   - remove all private methods? These should prolly have to be implemented
 *     in the extending class.
 *
*/
class UIElement {

	constructor(width, height) {

		this._originX = 0;
		this._originY = 0;

		this._width = width;
		this._height = height;

		this._id = 'anonymous'
		this._parentUI = null;

		this._handledInputs = [];
		this._handledEvents = ['render'];
	}

	toString() {
		return `<UIElement {${this.constructor.name}}>`
	}

	// For now the rendering context will always come from the parent, but the
	// idea is that the context could come from anywhere (or even be anything)
	get _ctx() {
		if (this._parentUI != null) {
			let ret = this._parentUI.ctx;
			ret.translate(this._originX, this._originY);
			return ret;
		}
	}

	acceptParentUIFrame(xOrigin, yOrigin, parentUIFrame, id) {
		this._id = id;
		this._parentUI = parentUIFrame;
		this._originX = xOrigin;
		this._originY = yOrigin;
	}

	_pointWithinBounds(point) {
		let withinX = (
			point.x >= this._originX &&
			point.x <= this._originX + this._width
		)
		let withinY = (
			point.y >= this._originY &&
			point.y <= this._originY + this._height
		)
		return withinX && withinY;
	}

	/* these two handlers are called by the coordinator or the parent ui */
	handleInput(input) {
		
	}

	handleEvent(event) {

	}

	render(model) {
		if (this._parentUI != null) {
			this._parentUI.newEvent({
				source: this.constructor.name,
				type: 'render',
				data: {
					originX: this._originX,
					originY: this._originY,
					width: this._width,
					height: this._height
				}
			});
		}
		this._render(model);
		if (this._ctx != null) {
			// TODO: Handle global access to the configuration
			// if (app.config.debug) {
				// this._ctx.fillStyle = 'black';
				this._ctx.strokeRect(0, 0, this._width, this._height);
				// this._ctx.font = '18px sans-serif';
				// this._ctx.fillText(this._id, 3, 15);
			// }
		}
	}

}

/*
 * A generic class for ui containers.
*/
class UIFrame extends UIElement {

	constructor(width, height) {
		super(width, height);
		this._children = new Map();
		this._currentChildId = 0;
	}


	get handledInputs() {
		let ret = this._handledInputs;
		for (const child of this._children.values()) {
			ret.push(...child.handledInputs);
		}
		return Array.from(new Set(ret));
	}

	get handledEvents() {
		let ret = this._handledEvents;
		for (const child of this._children.values()) {
			ret.push(...child.handledEvents);
		}
		return Array.from(new Set(ret));
	}

	/* Bookkeeping */
	_generateChildId() {
		let ret = this._currentChildId++;
		return ret;
	}

	// UIFrames can also pass child events up the chain. Note however that if
	// somehow a tree exists with UIFrames and UIElements that doesn't
	// eventually reach back to a root element, these messages go nowhere.
	// Additionally, currently messages shoot straight up the tree, but in the
	// future it would be beneficial to wrap them in "carrier" messages that
	// showed the "call stack".
	newEvent(event) {
		if (this._parentUI != null) {
			this._parentUI.newEvent(event);
		}
	}

	/*
	 * UI Frames may adopt both UIFrames and UIElements as their children. This
	 * Eventually forms a tree structure.
	*/
	// TODO: Add bounds checking
	adoptChildUIFrame(xOrigin, yOrigin, uiFrame, id = null) {
		let newChildId = id ?? this._generateChildId();
		uiFrame.acceptParentUIFrame(
			xOrigin, yOrigin, this, newChildId
		);
		this._children.set(newChildId, uiFrame);
	}

	// [Extended, Overridden]
	// handlePointSignal(point) {
	// 	// handle self, then children
	// 	super.handlePointSignal(point);
	// 	for (const child of this._children.values()) {
	// 		child.handlePointSignal(point)
	// 	}
	// }

	/* these two handlers are called by the coordinator */
	handleInput(input) {
		super.handleInput(input);
		for (const child of this._children.values()) {
			child.handleInput(input);
		}
	}

	handleEvent(event) {
		super.handleEvent(event);
		for (const child of this._children.values()) {
			child.handleEvent(event);
		}
	}

	render(model) {
		// render children then self
		for (const child of this._children.values()) {
			child.render(model);
		}
		super.render(model);
	}

}

/* 
 * The main UI Class that serves as the container, dispatcher and organizer of
 * all sub ui frames. Currently this relies on the canvas API, as that  is the
 * targeted rendering platform.
*/
class RootUIFrame extends UIFrame {

	constructor(width, height, canvasElement) {
		super(width, height);
		this._canvas = canvasElement;
		if (this._canvas.getContext) {
			this._canvas.height = this._height;
			this._canvas.width = this._width;

			// For more performant rendering, a shadow canvas is also rendered to.
			// If the model's state hash and the ui copy of that hash match, then
			// the call to render simply redraws the shadow canvas, rather than
			// redrawing all the primitives from scratch.
			this._shadowCanvas = document.createElement('canvas');
			this._shadowCanvas.width = this._width;
			this._shadowCanvas.height = this._height;

			this._realCtx = this._canvas.getContext('2d');
			this._realShadowCtx = this._shadowCanvas.getContext('2d');

		} else {
			throw new Error("Canvas API Not Supported");
		}
	}

	init(coordinator) {
		this._coordinator = coordinator;
		// Children added dynamically will need to re-add their event listeners
		this._coordinator.registerInputsListener(this.handledInputs, this);
		this._coordinator.registerEventsListener(this.handledEvents, this);
	}

	get ctx() {
		// resets the transform to defaults. Really this should make use of the
		// save and restore functions.
		this._realCtx.setTransform(1, 0, 0, 1, 0, 0);
		return this._realCtx;
	}

	get inputContext() {
		return this._canvas;
	}

	// The root ui sort of acts as a coordinator for it's children, so it too
	// has an event processing route for it to pass child events up to the
	// cordinator.
	newEvent(event) {
		this._coordinator.newEvent(event);
	}

	/* Rendering */

	render(model) {
		// We only bother to re-render if the model state has changed since the
		// last time we rendered.
		if (this._modelStateHash === model.stateHash) {
			console.log('no state change, rendering from shadow canvas');
			this.ctx.drawImage(this._shadowCanvas, 0, 0);
		} else {
			console.log('state change, rendering from scratch');
			// Setup
			this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
			// Drawing
			super.render(model);
			// Teardown
			// Get a render reciept
			this._modelStateHash = model.stateHash;
			// Save the last frame to the shadow canvas
			this._realShadowCtx.drawImage(this._canvas, 0, 0);
		}
	}

	// Will be called by parent class
	_render(model) {
		this._coordinator.newEvent({
			source: this.constructor.name,
			type: 'render',
			data: {
				originX: this._originX,
				originY: this._originY,
				width: this._width,
				height: this._height
			}
		});
	}

}
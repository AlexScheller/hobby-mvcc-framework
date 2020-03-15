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

	// [Extended, Overridden]
	handlePointSignal(point) {
		if (this._pointWithinBounds(point)) {
			console.log(`<${this.constructor.name}: ${this._id}> Pointed At`);
		}
	}

	render(model) {
		if (this._parentUI != null) {
			this._parentUI.newEvent(this.constructor.name, 'render', {
				originX: this._originX,
				originY: this._originY,
				width: this._width,
				height: this._height
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
	newEvent(child, eventType, eventData) {
		if (this._parentUI != null) {
			this._parentUI.newEvent(child, eventType, eventData);
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
	handlePointSignal(point) {
		// handle self, then children
		super.handlePointSignal(point);
		for (const child of this._children.values()) {
			child.handlePointSignal(point)
		}
	}

	render(model) {
		super.render(model);
		// render self then children
		this._render(model);
		for (const child of this._children.values()) {
			child.render(model);
		}
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
			this._realCtx = this._canvas.getContext('2d');
		} else {
			throw new Error("Canvas API Not Supported");
		}
	}

	init(coordinator) {
		this._coordinator = coordinator;
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
	newEvent(child, eventType, eventData) {
		this._coordinator.newEvent(child, eventType, eventData);
	}

	/* Rendering */

	_render(model) {
		this._coordinator.newEvent(this.constructor.name, 'render', {
			originX: this._originX,
			originY: this._originY,
			width: this._width,
			height: this._height
		});
		this._realCtx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}

}
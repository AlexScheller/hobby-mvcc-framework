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
 *
*/
class UIElement {

	static elementCount = 0;

	constructor(width, height) {
		this._originX = 0;
		this._originY = 0;
		this._width = width;
		this._height = height;
		this._id = UIElement.elementCount++;
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
	_handlePointSignal(point) {
		if (this._pointWithinBounds(point)) {
			console.log(`<${this.constructor.name}: ${this._id}> Pointed At`);
		}
	}

	// [Extended, Overridden]
	_render() {
		if (this._ctx != null) {
			if (app.config.debug) {
				this._ctx.strokeRect(0, 0, this._width, this._height);
				this._ctx.font = '16px sans-serif';
				this._ctx.fillText(this._id, 0, 0);
			}
		}
	}

	render() {
		this._render();
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

	/*
	 * UI Frames may adopt both UIFrames and UIElements as their children. This
	 * Eventually forms a tree structure.
	*/
	adoptChildUIFrame(xOrigin, yOrigin, uiFrame, id = null) {
		let newChildId = id ?? this._generateChildId();
		uiFrame.acceptParentUIFrame(
			xOrigin, yOrigin, this, newChildId
		);
		this._children.set(newChildId, uiFrame);
	}

	// [Extended, Overridden]
	_handlePointSignal(point) {
		for (const child of this._children.values()) {
			child._handlePointSignal(point)
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
			this._setupEventHandlers();
		} else {
			throw new Error("Canvas API Not Supported");
		}
	}

	get ctx() {
		return this._realCtx;
	}

	/* Sub UI Frames */
	adoptChildUIFrame(xOrigin, yOrigin, uiFrame, id = null) {
		let newChildId = id != null ? id : this._generateChildId();
		uiFrame.adoptParentUIFrame(
			xOrigin, yOrigin, this, newChildId
		);
		this._childUIs.set(newChildId, uiFrame);
	}

	/* Rendering */

	_render() {
		// render self then render children
		this._realCtx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		for (const child of this._childUIs.values()) {
			child.render();
		}
	}

	render() {
		this._render();
	}

}
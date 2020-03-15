class UITileSet {

	constructor() {
		this.tiles = {
			'field': {
				name: 'field',
				color: '#88cc00'
			},
			'city': {
				name: 'city',
				color: '#b3b3b3'
			}
		}
	}

	get size() {
		return Object.keys(this.tiles).length;
	}

	get types() {
		return Object.keys(this.tiles);
	}

	getTileFromType(tileType) {
		return tileType in this.tiles ? this.tiles[tileType] : null;
	}

}

class HexGridFrame extends UIFrame {

	constructor(width, height, uiTileSet) {
		super(width, height);
		this.tileset = uiTileSet;
		this._hexSize = 30; // pixels from center to corner
		// offset the hexes so they don't begin rendering at (0, 0).
		this._gridOffset = this._hexSize * 2;
		this._clickedString = null;
	}

	setListener(listener) {
		this._listener = listener;
	}

	// helper rendering methods

	// This is the case for pointy topped hexes, for flat top hexes the
	// calculation for width and center to corner length are swapped.
	get _hexHalfWidth() {
		return this._hexWidth / 2;
	}

	get _hexWidth() {
		return Math.sqrt(3) * this._hexSize;
	}

	get _hexHalfHeight() {
		return this._hexSize;
	}

	get _hexHeight() {
		return 2 * this._hexSize;
	}

	_hex_corner_point(center, size, corner) {
		let angleDeg = 60 * corner - 30; // pointy top, so offset
		let angleRad = Math.PI / 180 * angleDeg;
		return {
			x: center.x + size * Math.cos(angleRad),
			y: center.y + size * Math.sin(angleRad)
		}
	}

	_rowColToPixelCenter(row, col) {
		let natural = new Hex(row, col).toPixel(this._hexSize);
		return new Point(
			natural.x + this._gridOffset,
			natural.y + this._gridOffset
		);
	}

	// TODO: Make hexes their own ui elements with their own render methods?
	_renderHex(hex) {
		let ctx = this._ctx;
		ctx.beginPath();
		let center = this._rowColToPixelCenter(hex.row, hex.col);
		// render the border
		let borderCorner = this._hex_corner_point(center, this._hexSize, 0);
		ctx.moveTo(borderCorner.x, borderCorner.y);
		for (let i = 1; i < 6; i++) {
			borderCorner = this._hex_corner_point(center, this._hexSize, i);
			ctx.lineTo(borderCorner.x, borderCorner.y);			
		}
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.stroke();
		// fill the hex
		let corner = this._hex_corner_point(center, this._hexSize - 1, 0);
		ctx.moveTo(corner.x, corner.y);
		for (let i = 1; i < 6; i++) {
			corner = this._hex_corner_point(center, this._hexSize - 1, i);
			ctx.lineTo(corner.x, corner.y);			
		}
		ctx.closePath();
		// This is temporary and should be removed soon. Debugging.
		if (this._clickedString === hex.toString()) {
			ctx.fillStyle = 'red';
		} else {
			ctx.fillStyle = this.tileset.getTileFromType(hex.type).color;
		}
		ctx.fill();
		// TODO: Create a global debug flag
		ctx.font = '12px sans-serif';
		ctx.fillStyle = 'black';
		ctx.fillText(
			`(${hex.row}, ${hex.col})`,
			center.x - (this._hexSize / 2) - 5,
			center.y
		);
	}

	// main render method
	_render(model) {
		/* draw the grid */
		let hexes = model.hexGrid.getAllHexes();
		for (const hex of hexes) {
			this._renderHex(hex);
		}
	}

	_handleClick(event) {
		super._handleClick(event);
		let p = {x: event.offsetX, y: event.offsetY}
		console.log(`Click event: x = ${p.x}, y = ${p.y}`);
		if (this._parentUI != null) {
			if (
				this._pointWithinBounds(p)
			) {
				let clickedHex = Hex.pixelToHex(
					{
						x: p.x - this._gridOffset,
						y: p.y - this._gridOffset
					},
					this._hexSize
				)
				if (this._gridModel.contains(clickedHex)) {
					this._listener.handleEvent('mapHexClicked', clickedHex);
				} else {
					console.log('Hex outside bounds');					
				}
			}
		}
	}

	render(model) {
		super._render(model);
		this._render(model);
	}

}

class TilePalleteFrame extends UIFrame {

	constructor(width, height, uiTileSet) {
		super(width, height);
		this.tileset = uiTileSet;
		this.selectedTile = this.tileset.getTileFromType('field');
		this._tileSize = 45;
	}

	setListener(listener) {
		this._listener = listener;
	}

	_handleClick(event) {
		super._handleClick(event);
		if (this._parentUI != null) {
			if (
				this._pointWithinBounds({ x: event.offsetX, y: event.offsetY })
			) {
				// Right now this just bounces back and forth as a proof of
				// concept.
				if (this.selectedTile.name == 'city') {
					this.selectedTile = this.tileset.getTileFromType('field');
				} else {
					this.selectedTile = this.tileset.getTileFromType('city');
				}
				this._listener.handleEvent('tileToolClicked', this.selectedTile);
			}
		}
	}

	_renderHex(center, type) {
		let ctx = this._ctx;
		ctx.beginPath();
		// render the border
		let borderCorner = Hex.cornerPoint(center, this._tileSize, 0);
		ctx.moveTo(borderCorner.x, borderCorner.y);
		for (let i = 1; i < 6; i++) {
			borderCorner = Hex.cornerPoint(center, this._tileSize, i);
			ctx.lineTo(borderCorner.x, borderCorner.y);			
		}
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.stroke();
		// fill the hex
		let corner = Hex.cornerPoint(center, this._tileSize - 1, 0);
		ctx.moveTo(corner.x, corner.y);
		for (let i = 1; i < 6; i++) {
			corner = Hex.cornerPoint(center, this._tileSize - 1, i);
			ctx.lineTo(corner.x, corner.y);			
		}
		ctx.closePath();
		ctx.fillStyle = this.tileset.getTileFromType(type).color;
		ctx.fill();
	}

	// renders the tile selections
	_render(model) {
		let tileTypes = this.tileset.types;
		let offsetY = 50;
		for (let i = 0; i < tileTypes.length; i++) {
			let center = {
				x: this._originX + (this._width / 2),
				y: this._originY + (i * (this._tileSize * 2.5)) + offsetY
			};
			this._renderHex(center, tileTypes[i])
		}
	}

	render(model) {
		super._render(model);
		this._render(model);
	}

}

class HexGridUI extends RootUIFrame {

	constructor(width, height, canvas) {
		super(width, height, canvas);
	}

	init(coordinator) {
		super.init(coordinator);
		let tileset = new UITileSet();
		let gridUI = new HexGridFrame(
			(this._width / 8) * 7, this._height, tileset
		);
		let tilePalleteUI = new TilePalleteFrame(
			(this._width / 8) * 1, this._height, tileset
		);
		this.adoptChildUIFrame(0, 0, gridUI, 'hex-grid');
		this.adoptChildUIFrame(
			(this._width / 8) * 7, 0,
			tilePalleteUI, 'tile-pallete'
		);
	}

}
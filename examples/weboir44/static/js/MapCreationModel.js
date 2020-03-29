class HexModel {

	constructor(row, col, baseType = 'field') {
		this._hex = new Hex(row, col);
		this._baseType = baseType;
	}

	// TODO: Actually include hexmodel info, not just the inner hex
	toString() {
		return `<HexModel row = ${this._hex.row}, col = ${this._hex.col}, type = ${this._baseType}`;
	}

	get row() {
		return this._hex.row;
	}

	get col() {
		return this._hex.col;
	}

	get type() {
		return this._baseType;
	}

}

// Note that the model uses axial coordinates as described here:
// https://www.redblobgames.com/grids/hexagons/#coordinates for
class GridModel extends Model {

	constructor(mapHeight = 9, mapTopWidth = 13) {
		super();
		this._hexes = this._initializeMap(mapHeight, mapTopWidth);
	}

	// Using an array of arrays to store axial coordinates.
	_initializeMap(height, topWidth) {
		let ret = [];
		for (let row = 0; row < height; row++) {
			let newRow = [];
			let rowLength = (row % 2 == 0) ? topWidth : topWidth - 1;
			for (let col = 0; col < rowLength; col++) {
				let offsetCol = col - Math.floor(row / 2);
				newRow.push(new HexModel(row, offsetCol, 'field'));
			}
			ret.push(newRow);
		}
		return ret;
	}

	getHeight() {
		return this._hexes.length;
	}

	getRowWidth(row) {
		if (this._hexes.length < 1) return 0;
		if (row < 0 || row > this._hexes.length) return 0;
		return this._hexes[row].length;
	}

	getHex(row, col) {
		if (this._hexes.length < 1 || this._hexes[0].length < 1) return null;
		if (row >= 0 && row < this._hexes.length) {
			let offsetCol = col + Math.floor(row / 2);
			if (offsetCol >= 0 && offsetCol < this._hexes[0].length) {
				return this._hexes[row][offsetCol];
			}
		}
		return null;
	}

	contains(hex) {
		return this.getHex(hex.row, hex.col) != null;
	}

	updateHex(hex, type) {
		if (this.contains(hex)) {
			let offsetCol = hex.col + Math.floor(hex.row / 2);
			this._hexes[hex.row][offsetCol]._baseType = type;
		}
	}

	// returns a flat collection of the hexes
	getAllHexes() {
		let ret = [];
		for (let row = 0; row < this._hexes.length; row++) {
			ret = ret.concat(this._hexes[row]);
		}
		return ret;
	}

}

class MapCreationModel extends Model {

	constructor(params = null) {
		let newParams = params ?? {
			hexRows: 9,
			hexCols: 13
		}
		super(newParams);
		this.hexGrid = null;
		this.tileset = null;
		this._toolContext = {
			selectedTileTool: 'field'
		}
		this._handledEvents = ['grid-hex-activated', 'hex-tool-activated'];
	}

	init(coordinator, params = null) {
		super.init(coordinator, params);
	}

	// Current
	_load(params) {
		super._load(params);
		let hexRows = params.hexRows ?? 9;
		let hexCols = params.hexCols ?? 13;
		this.hexGrid = new GridModel(hexRows, hexCols);
		// Full of redundant info right now, but will grow.
		this.tileset = {
			'field': {
				name: 'field'
			},
			'city': {
				name: 'city'
			},
			'forrest': {
				name: 'forrest'
			},
			'hill': {
				name: 'hill'
			}
		}
	}

	// Note that since this is a largely reactive application, it's not
	// the best for demonstrating the `update` method, as most of the
	// actual updates are the result of event handling, rather than
	// tick handling.
	handleEvent(event) {
		switch(event.type) {
			case 'grid-hex-activated':
				this._handleHexActivated(event.data);
				break;
			case 'hex-tool-activated':
				this._handleHexToolActivated(event.data);
				break;
			default:
			console.error(
				`MapCreationModel cannot handle event: ${event.type}`
			);
		}
	}

	/* event handlers */
	_handleHexActivated(hex) {
		this.hexGrid.updateHex(hex, this._toolContext.selectedTileTool);
	}

	_handleHexToolActivated(type) {
		if (type in this.tileset) {
			this._toolContext.selectedTileTool = type;
		}
	}

}
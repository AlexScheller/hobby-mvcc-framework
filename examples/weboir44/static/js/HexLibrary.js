// NOTE that all hexes below are point topped hexes

class Point {

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

}

class Cube {

	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	toString() {
		return `<Cube x = ${this.x}, y = ${this.y}, z = ${this.z}>`;
	}

	toAxial() {
		return new Hex(this.z, this.x);
	}

	static round(cube) {
		let rx = Math.round(cube.x);
		let ry = Math.round(cube.y);
		let rz = Math.round(cube.z);

		let xDiff = Math.abs(rx - cube.x);
		let yDiff = Math.abs(ry - cube.y);
		let zDiff = Math.abs(rz - cube.z);

		if (xDiff > yDiff && xDiff > zDiff) {
			rx = -ry - rz;
		} else if (yDiff > zDiff) {
			ry = -rx - rz;
		} else {
			rz = -rx - ry;
		}

		return new Cube(rx, ry, rz);
	}

}

// Note this class uses axial coords, and any references to axial coords can
// be assumed to refer to this class.
class Hex {

	constructor(row, col) {
		this.row = row;
		this.col = col;
	}

	toString() {
		return `<Hex row = ${this.row}, col = ${this.col}>`;
	}

	toCube() {
		return new Cube(this.col, -this.col - this.row, this.row)
	}

	// Hex's don't know anything about size internally so that if the hexes
	// need to be grown or shrunk visually all that needs to be done is to
	// pass a different value to this function, rather than update all the
	// stored hexes size values. This also helps separate the model from the
	// view, in the sense that although this function is called "toPixel",
	// it doesn't actually specify what the units are.
	toPixel(size) {
		let x = size * (
			(Math.sqrt(3) * this.col) + ((Math.sqrt(3)/2) * this.row)
		);
		let y = size * ((3/2) * this.row); 
		return new Point(x, y);
	}

	static round(hex) {
		return Cube.round(hex.toCube()).toAxial();
	}

	static cornerPoint(center, size, corner) {
		let angleDeg = 60 * corner - 30; // pointy top, so offset
		let angleRad = Math.PI / 180 * angleDeg;
		return {
			x: center.x + size * Math.cos(angleRad),
			y: center.y + size * Math.sin(angleRad)
		}
	}

	// Note that this handles a grid of infinite size, that is to say it will
	// dutifully return the correct hex without doing any bounds checking. It's
	// up the caller to ensure that the hex returned actually exists in the
	// grid presented.
	static pixelToHex(point, size) {
		let col = (
			((Math.sqrt(3)/3) * point.x) - ((1/3) * point.y)
		) / size;
		let row = ((2/3) * point.y) / size;
		return Hex.round(new Hex(row, col));
	}

}

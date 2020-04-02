/* Driver Code */

/* piecemeal initialization */

// Initialize the Model
let model = new MapCreationModel({hexRows: 9, hexCols: 13});

// Initialize the controller
let controller = new MouseController();

// Inititalize UI
let canvasEl = document.getElementById('main-canvas');
let view = new HexGridUI(900, 480);

// Initialize Application
let mapCreatorApp = new Application({
	applicationName: 'Map Creator',
	debug: false
}, model, view, controller);

/* All-in-one intialization */
// TODO: Make this way less fragile.
let mapCreatorApp = new Application();
mapCreatorApp.init({
	config: {
		name: 'Map Creator',
		debug: false,
	},
	model: {
		class: MapCreationModel,
		params: {
			hexRows: 9, hexCols: 13
		}
	},
	view: {
		class: HexGridUI,
		params: {
			width: 900
			height: 480,
			canvases: [
				{
					name: 'main',
					type: 'main',
					elementId: 'main-canvas'
				},
				{
					name: 'ui',
					type: 'ui',
					name: 'ui-canvas'
				}
			]
		}
	},
	controllers: [
		{ class: MouseController }
	]
});

// Run the application
mapCreatorApp.run();
/* Driver Code */

/* Initialize the Model */
let model = new MapCreationModel({hexRows: 9, hexCols: 13});

/* Initialize the controller */
let controller = new MouseController();

/* Inititalize UI */
let canvasEl = document.getElementById('main-canvas');
let view = new HexGridUI(900, 480, canvasEl);

/* Initialize Application */
let mapCreatorApp = new Application({
	applicationName: 'Map Creator',
	debug: true
}, model, view, controller);

mapCreatorApp.run();
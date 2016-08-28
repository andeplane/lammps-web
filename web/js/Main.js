var buttonUpdate, buttonSave, buttonHide
function createGUI() {
	// Build GUI
	var toolbar = document.getElementById( 'toolbar' );
	buttonUpdate = document.createElement( 'button' );
	buttonUpdate.className = 'button';
	buttonUpdate.appendChild( document.createTextNode( 'run lammps script' ) );
	buttonUpdate.addEventListener( 'click', function ( event ) {
		var value = editor.getValue();
		currentScript = value
		runScript()
	}, false );
	toolbar.appendChild( buttonUpdate );

	// buttonSave = document.createElement( 'button' );
	// buttonSave.className = 'button';
	// buttonSave.textContent = 'save';
	// buttonSave.addEventListener( 'click', function ( event ) {
	// 	save();
	// }, false );
	// toolbar.appendChild( buttonSave );

	buttonHide = document.createElement( 'button' );
	buttonHide.className = 'button';
	buttonHide.textContent = 'hide code';
	buttonHide.addEventListener( 'click', toggleEditorVisible, false );
	toolbar.appendChild( buttonHide );
}

function save() {
	documents[ 0 ].code = codemirror.getValue();

	localStorage.codeeditor = JSON.stringify( documents );

	var blob = new Blob( [ codemirror.getValue() ], { type: documents[ 0 ].filetype } );
	var objectURL = URL.createObjectURL( blob );

	buttonDownload.href = objectURL;

	var date = new Date();
	buttonDownload.download = documents[ 0 ].filename;

	buttonSave.style.display = 'none';
	buttonDownload.style.display = '';
}

function toggleEditorVisible() {
	var code = document.getElementById( 'editor' );
	if ( code.style.display === '' ) {
		buttonHide.textContent = 'show code';
		code.style.display = 'none';
		buttonUpdate.style.display = 'none';
		buttonSave.style.display = 'none';
	} else {
		buttonHide.textContent = 'hide code';
		code.style.display = '';
		buttonUpdate.style.display = '';
		buttonSave.style.display = '';
	}
}

var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
	lineNumbers: true,
	styleActiveLine: true,
	matchBrackets: true,
	viewportMargin: Infinity
});

editor.setOption("theme", "monokai");

createGUI()

document.addEventListener( 'keydown', function ( event ) {
	if ( event.keyCode === 83 && ( event.ctrlKey === true || event.metaKey === true ) ) {
		event.preventDefault();
		save();
	}

	if ( event.keyCode === 82 && ( event.ctrlKey === true || event.metaKey === true ) ) {
		event.preventDefault();
		var value = editor.getValue();
		currentScript = value
		runScript()
	}

	if ( event.keyCode === 27 ) { toggleEditorVisible() }

}, false );

initGL();
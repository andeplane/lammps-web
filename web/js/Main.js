var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
	lineNumbers: true,
	styleActiveLine: true,
	matchBrackets: true,
	viewportMargin: Infinity
});
var input = document.getElementById("select");

editor.setOption("theme", "monokai");

// Build GUI
var toolbar = document.getElementById( 'toolbar' );
var buttonUpdate = document.createElement( 'button' );
buttonUpdate.className = 'button';

buttonUpdate.appendChild( document.createTextNode( 'run lammps script' ) );

buttonUpdate.addEventListener( 'click', function ( event ) {
	var value = editor.getValue();
	currentScript = value
	runScript()
}, false );
toolbar.appendChild( buttonUpdate );

var buttonSave = document.createElement( 'button' );
buttonSave.className = 'button';
buttonSave.textContent = 'save';
buttonSave.addEventListener( 'click', function ( event ) {
	save();
}, false );
toolbar.appendChild( buttonSave );

var buttonHide = document.createElement( 'button' );
buttonHide.className = 'button';
buttonHide.textContent = 'hide code';
buttonHide.addEventListener( 'click', function ( event ) {
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
}, false );
toolbar.appendChild( buttonHide );

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

	if ( event.keyCode === 27 ) {
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

}, false );

init();
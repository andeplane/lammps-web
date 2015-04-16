var md = {
	runCommands: Module.cwrap('runCommands', 'void', ['string']),
	resetLammps: Module.cwrap('resetLammps', 'void', []),
	numberOfAtoms: Module.cwrap('numberOfAtoms', 'number', []),
	systemSizeX: Module.cwrap('systemSizeX', 'number', []),
	systemSizeY: Module.cwrap('systemSizeY', 'number', []),
	systemSizeZ: Module.cwrap('systemSizeZ', 'number', []),
	positions: Module.cwrap('positions', 'number', []),
	x: Module.cwrap('x', 'number', []),
	v: Module.cwrap('v', 'number', []),
	f: Module.cwrap('f', 'number', []),
	initialized: false
}

Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

var runScript = function() {
	var content = document.getElementById("lammpsCode").value
	
	setTimeout(
		function() { 
			md.runCommands(content)
			document.getElementById("runScriptButton").disabled = true;
			document.getElementById("stopButton").disabled = false;
			
			if(!md.initialized) {
				init()
				animate()
				md.initialized = true
			}
		}, 500);
}

function systemSize() {
	return new THREE.Vector3(md.systemSizeX(), md.systemSizeY(), md.systemSizeZ());;
}

function systemSizeHalf() {
	return systemSize().multiplyScalar(0.5);
}

function glWindowWidth() {
	return $('#webglwindow').width();
}

function glWindowHeight() {
	return $('#webglwindow').height();
}

function init() {
	var webglwindow = document.getElementById("webglwindow");
	container = document.createElement( 'div' );
	webglwindow.appendChild( container );
	
	var systemSizeHalfVec = systemSizeHalf();
	camera = new THREE.PerspectiveCamera( 60, glWindowWidth() / glWindowHeight(), 2, 2000 );
	
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = -6*systemSizeHalfVec.z;

	controls = new THREE.TrackballControls( camera, webglwindow);
	controls.target.set( 0,0,0 )
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;
	controls.noRoll = true;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [ 65, 83, 68 ];
	controls.addEventListener( 'change', render );

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.001 );

	upVector = new THREE.Vector3().copy(camera.up);
	viewVector = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( camera.quaternion );
	rightVector = new THREE.Vector3( 1, 0, 0 ).applyQuaternion( camera.quaternion );

	var map = THREE.ImageUtils.loadTexture('images/sphere.png');
	var normal = THREE.ImageUtils.loadTexture('images/normalMap.png');
	normal.flipy = true
	
	var material = new THREE.BillboardSpheresMaterial( { 
	// var material = new THREE.MeshPhongMaterial( { 
		ambient: 0x050505, 
		color: 0x0033ff, 
		specular: 0x555555, 
		shininess: 30,
		map: map,
		normalMap: normal,
		wrapAround: true,
		transparent: true,
		alphaTest: 0.95
	} );
	
	geometry = new THREE.BillboardSpheres(camera);
	var mesh = new THREE.Mesh( geometry, material );
	scene.add(mesh);

	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	var directional = new THREE.DirectionalLight( 0xffffff );
	directional.position.set( 0, 1, 1 ).normalize();
	scene.add(directional);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( glWindowWidth(), glWindowHeight() );
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = glWindowWidth() / glWindowHeight()
	camera.updateProjectionMatrix();

	renderer.setSize( glWindowWidth(), glWindowHeight() );
}

function updateVertices() {
	var systemSizeHalfVec = systemSizeHalf();
	var systemSizeVec = systemSize();

	var positions = [];
	positions.length = md.numberOfAtoms();
	var colors = [];
	colors.length = md.numberOfAtoms();
	var atomPositions = md.positions();

	for ( i = 0; i < md.numberOfAtoms(); i ++ ) {
		// var positionPointer = getValue(md.x() + 8*i, '*');
		// var x = Math.fmod(getValue(positionPointer, 'double'), systemSizeVec.x);
		// var y = Math.fmod(getValue(positionPointer + 8, 'double'), systemSizeVec.y);
		// var z = Math.fmod(getValue(positionPointer + 16, 'double'), systemSizeVec.z);
		// var x = getValue(positionPointer, 'double');
		// var y = getValue(positionPointer + 8, 'double');
		// var z = getValue(positionPointer + 16, 'double');
		var x = getValue(atomPositions + 24*i, 'double');
		var y = getValue(atomPositions + 24*i + 8, 'double');
		var z = getValue(atomPositions + 24*i + 16, 'double');

		positions[i] = new THREE.Vector3(x,y,z);
		positions[i].sub(systemSizeHalfVec);
		colors[i] = new THREE.Vector3(1.0, 0.0, 0.0);
	}
	upVector = new THREE.Vector3().copy(camera.up);
	viewVector = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( camera.quaternion );
	rightVector = new THREE.Vector3( 1, 0, 0 ).applyQuaternion( camera.quaternion );
	
	geometry.update(positions, colors, upVector, rightVector);
	geometry.verticesNeedUpdate = true
}

var stop = false;

function animate() {
	if(!stop) {
		md.runCommands("run 1 pre no post no");
	}
	
	animationId = requestAnimationFrame( animate );
	controls.update();
	updateVertices();
	render();
	
	stop = true;
}

function togglePause() {
	if(pause) {
		document.getElementById("stopButton").innerHTML = "Pause";
		animate();
	} else {
		document.getElementById("stopButton").innerHTML = "Unpause";
		cancelAnimationFrame(animationId);
	}
	pause = !pause;
}

function render() {
	renderer.render( scene, camera );
}

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container;
var animationId;
var camera, controls, scene, renderer, particles, geometry, material, i, h, color, sprite, size;
var rightVector, upVector, viewVector;
var mouseX = 0, mouseY = 0;
var theta = 0, phi = 0;
var pause = false;
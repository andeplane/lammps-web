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
	camera = new THREE.PerspectiveCamera( 60, glWindowWidth() / glWindowHeight(), 0.1, 2000 );
	camera.position.z = -10;

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

	var map = THREE.ImageUtils.loadTexture('images/sphere.png');
	var normal = THREE.ImageUtils.loadTexture('images/normalMap.png');
	
	material = new THREE.BillboardSpheresMaterial( { 
		ambient: 0x050505, 
		specular: 0x555555, 
		shininess: 0,
		vertexColors: THREE.FaceColors,
		// map: map,
		normalMap: normal,
		wrapAround: false,
		transparent: true
	} );

	// material = new THREE.RawShaderMaterial({
	// 	uniforms: THREE.UniformsLib['lights'],
	// 	attributes: [],
	// 	vertexShader: vertexShader,
 //  		fragmentShader: fragmentShader,
 //  		shininess: 30,
 //  		ambient: 0x050505, 
 //  		specular: 0x555555, 
 //  		lights: true,
 //  		vertexColors: THREE.FaceColors,
 //  		wrapAround: false,
 //  		transparent: true
	// });
	
	geometry = new THREE.Geometry();
	mesh = new THREE.Mesh( geometry, material );
	scene.add(mesh);

	lights.ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( lights.ambient );

	lights.directional = new THREE.DirectionalLight( 0xffffff );
	lights.directional.position.set( 0, 0, -10);
	scene.add(lights.directional);
	
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

	geometry.vertices.length = 4*md.numberOfAtoms();
	geometry.faces.length = 2*md.numberOfAtoms();
	geometry.faceVertexUvs[0].length = 2*md.numberOfAtoms();

	for ( i = 0; i < md.numberOfAtoms(); i ++ ) {
		var x = getValue(atomPositions + 24*i, 'double');
		var y = getValue(atomPositions + 24*i + 8, 'double');
		var z = getValue(atomPositions + 24*i + 16, 'double');
		var pos = new THREE.Vector3(x,y,z);
		pos.sub(systemSizeHalfVec);
		var color = new THREE.Color(1.0, 0.0, 0.0);

		geometry.vertices[4*i+0] = pos;
		geometry.vertices[4*i+1] = pos;
		geometry.vertices[4*i+2] = pos;
		geometry.vertices[4*i+3] = pos;
		geometry.faces[2*i+0] = new THREE.Face3(4*i+0, 4*i+1, 4*i+2, [], color);
		geometry.faces[2*i+1] = new THREE.Face3(4*i+2, 4*i+3, 4*i+0, [], color);
		geometry.faceVertexUvs[0][2*i+0] = [new THREE.Vector2(1,0), new THREE.Vector2(1,1), new THREE.Vector2(0,1)];
		geometry.faceVertexUvs[0][2*i+1] = [new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,0)];
	}
	
	geometry.verticesNeedUpdate = true
	geometry.elementsNeedUpdate = true
	geometry.uvsNeedUpdate = true
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
	
	// stop = true;
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
	mesh.updateMatrix();
	camera.updateMatrixWorld();
	// console.log("Camera pos: "+camera.position.x+" "+camera.position.y+" "+camera.position.z);
	upVector = new THREE.Vector3().copy(camera.up);
	viewVector = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( camera.quaternion );
	rightVector = new THREE.Vector3( 1, 0, 0 ).applyQuaternion( camera.quaternion );

	// console.log("Up: "+upVector.x+", "+upVector.y+", "+upVector.z)
	// console.log("Right: "+rightVector.x+", "+rightVector.y+", "+rightVector.z)
	t = (Date.now() - t0) / 1000;
	lights.directional.position.set(0, 0, 10*Math.cos(0.1*2*Math.PI*t));
	renderer.render( scene, camera );
}

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var t0 = Date.now();
var lights = {}
var container;
var animationId;
var camera, controls, scene, renderer, particles, geometry, material, i, h, color, sprite, size;
var mesh;
var rightVector, upVector, viewVector;
var mouseX = 0, mouseY = 0;
var theta = 0, phi = 0;
var pause = false;
var md = {
	runCommands: Module.cwrap('runCommands', 'void', ['string']),
	checkInitialized: Module.cwrap('checkInitialized', 'void', []),
	resetLammps: Module.cwrap('resetLammps', 'void', []),
	numberOfAtoms: Module.cwrap('numberOfAtoms', 'number', []),
	systemSizeX: Module.cwrap('systemSizeX', 'number', []),
	systemSizeY: Module.cwrap('systemSizeY', 'number', []),
	systemSizeZ: Module.cwrap('systemSizeZ', 'number', []),
	x: Module.cwrap('x', 'number', []),
	v: Module.cwrap('v', 'number', []),
	f: Module.cwrap('f', 'number', []),
	initialized: false
}

var sysx = Module.cwrap('systemSizeX', 'number', []);

var runScript = function() {
	var content = document.getElementById("lammpsCode").value
	console.log("Running script...");
	setTimeout(
		function() { 
			md.runCommands(content)

			if(!md.initialized) {
				var logger = document.getElementById('log');
				console.log = function (message) {
				    if (typeof message == 'object') {
				        logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '\n';
				    } else {
				        logger.innerHTML += message + '\n';
				    }
				}
				init()
				md.initialized = true
			}
		}, 500);
}

function systemSizeHalf() {
	return new THREE.Vector3(0.5*md.systemSizeX(), 0.5*md.systemSizeY(), 0.5*md.systemSizeZ());;
}

function glWindowWidth() {
	console.log("Window size: "+$('#webglwindow').width()+" x "+$('#webglwindow').height() )
	return $('#webglwindow').width();
}

function glWindowHeight() {
	return $('#webglwindow').height();
}

function init() {
	var webglwindow = document.getElementById("webglwindow");
	container = document.createElement( 'div' );
	webglwindow.appendChild( container );

	camera = new THREE.PerspectiveCamera( 60, glWindowWidth() / glWindowHeight(), 2, 2000 );
	
	var systemSizeHalfVec = systemSizeHalf();
	console.log("System size: "+systemSizeHalfVec)

	camera.position.x = 2*systemSizeHalfVec.y;
	camera.position.y = 2*systemSizeHalfVec.y;
	camera.position.z = 6*systemSizeHalfVec.z;

	controls = new THREE.TrackballControls( camera );
	controls.target.set( 0,0,0 )
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [ 65, 83, 68 ];
	controls.addEventListener( 'change', render );

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.001 );

	geometry = new THREE.Geometry();

	sprite = THREE.ImageUtils.loadTexture( "disc.png" );

	for ( i = 0; i < md.numberOfAtoms(); i ++ ) {
		var positionPointer = getValue(md.x() + 8*i, '*');

		var vertex = new THREE.Vector3();
		vertex.x = getValue(positionPointer, 'double');
		vertex.y = getValue(positionPointer + 8, 'double');
		vertex.z = getValue(positionPointer + 16, 'double');
		vertex.sub(systemSizeHalfVec);

		geometry.vertices.push( vertex );
	}

	material = new THREE.PointCloudMaterial( { size: 35, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true } );
	material.color.setHSL( 1.0, 0.3, 0.7 );

	particles = new THREE.PointCloud( geometry, material );
	scene.add( particles );

	//

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

	for ( i = 0; i < md.numberOfAtoms(); i ++ ) {
		var positionPointer = getValue(md.x() + 8*i, '*');
		geometry.vertices[i].x = getValue(positionPointer, 'double');
		geometry.vertices[i].y = getValue(positionPointer + 8, 'double');
		geometry.vertices[i].z = getValue(positionPointer + 16, 'double');
		geometry.vertices[i].sub(systemSizeHalfVec);
	}

	geometry.verticesNeedUpdate = true
}

var balle = 1

function animate() {
	console.log("Animating...");
	md.runCommands("run 1 pre no post no");
	updateVertices();

	requestAnimationFrame( animate );
	controls.update();
	render();
}

function render() {
	var time = Date.now() * 0.00005;				

	h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
	material.color.setHSL( h, 0.5, 0.5 );

	renderer.render( scene, camera );

}

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container;
var camera, controls, scene, renderer, particles, geometry, material, i, h, color, sprite, size;
var mouseX = 0, mouseY = 0;
var theta = 0, phi = 0;
// init();
// animate();
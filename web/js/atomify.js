var maxNumAtoms = 10;
var currentScript = ""
var lammpsPtr = -1

var Atomify = {
	runCommands: Module.cwrap('runCommands', 'void', ['string']),
	addAtomifyFix: Module.cwrap("addAtomifyFix", "void", []),
	setCallback: Module.cwrap("setCallback", "void", ["number"]),
	active: Module.cwrap('active', 'bool', []),
	reset: Module.cwrap('reset', 'number', []),
	runDefault: Module.cwrap('runDefaultScript', 'void', []),
	numberOfAtoms: Module.cwrap('numberOfAtoms', 'number', []),
	systemSizeX: Module.cwrap('systemSizeX', 'number', []),
	systemSizeY: Module.cwrap('systemSizeY', 'number', []),
	systemSizeZ: Module.cwrap('systemSizeZ', 'number', []),
	positions: Module.cwrap('positions', 'number', []),
	x: Module.cwrap('x', 'number', []),
	v: Module.cwrap('v', 'number', []),
	f: Module.cwrap('f', 'number', []),
	lammps_command: Module.cwrap("lammps_command", "number", ["number", "string"]),
	lammps_commands_string: Module.cwrap("lammps_commands_string", "void" , ["number", "string"]),
	lammps_extract_setting: Module.cwrap("lammps_extract_setting", "number" , ["number", "string"]),
	lammps_get_natoms: Module.cwrap("lammps_get_natoms", "number" , ["number"]),
	lammps_extract_global: Module.cwrap("lammps_extract_global", "number", ["number", "string"]),
	lammps_extract_atom: Module.cwrap("lammps_extract_atom", "number", ["number", "string"]),
	lammps_extract_compute: Module.cwrap("lammps_extract_compute", "number", ["number", "string", "number", "number"]),
	lammps_extract_fix: Module.cwrap("lammps_extract_fix", "number", ["number", "string", "number", "number", "number", "number"]),
	lammps_extract_variable: Module.cwrap("lammps_extract_variable", "number", ["number", "string", "string"]),
	lammps_set_variable: Module.cwrap("lammps_set_variable", "number" , ["number", "string", "string"]),
	lammps_get_thermo: Module.cwrap("lammps_get_thermo", "number" , ["number", "string"]),
	lammps_has_error: Module.cwrap("lammps_has_error", "number" , ["number"]),
	lammps_get_last_error_message: Module.cwrap("lammps_get_last_error_message", "number" , ["number", "string", "number"]),
	initialized: false
}

var runScript = function() {
	setTimeout(
		function() { 
			if(lammpsPtr === -1) {
				lammpsPtr = Atomify.reset()
				// Atomify.addAtomifyFix()
			} else if(Atomify.active()) {
				lammpsPtr = Atomify.reset()
				// Atomify.addAtomifyFix()
			}
			Atomify.runCommands(currentScript)
			
			if(!Atomify.initialized) {
				Atomify.initialized = true
				animate()
			}
		}, 500);
}

function synchronizeLAMMPS()
{
	if(!Atomify.active()) {
		return;
	}

	console.log("Synchronizing LAMMPS")
	animationId = requestAnimationFrame( animate );
	controls.update();
	updateVertices()
	render();
}

function systemSize() {
	return new THREE.Vector3(Atomify.systemSizeX(), Atomify.systemSizeY(), Atomify.systemSizeZ());;
}

function systemSizeHalf() {
	return systemSize().multiplyScalar(0.5);
}
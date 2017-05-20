CXX = emcc
MAXMEMORY = 512MB

LAMMPS_SOURCE := $(wildcard lammps/src/*.cpp)
LAMMPS_OBJ_FILES := $(addprefix obj/,$(notdir $(LAMMPS_SOURCE:.cpp=.o)))

LD_FLAGS := -O3
CC_FLAGS := -O3 -DLAMMPS_EXCEPTIONS -DLAMMPS_SMALLSMALL
INCLUDE_FLAGS := -Ilammps/src/STUBS/ -Ilammps/src
SYMBOLS := -s ASSERTIONS=2 -s RESERVED_FUNCTION_POINTERS=1 -s DISABLE_EXCEPTION_CATCHING=0 -s TOTAL_MEMORY=$(MAXMEMORY) -s EXPORTED_FUNCTIONS="['_runCommands', '_addAtomifyFix', '_numberOfAtoms', '_setCallback', '_reset', '_runDefaultScript', '_systemSizeX', '_systemSizeY', '_systemSizeZ', '_positions', '_x', '_v', '_f', '_active', '_lammps_command', '_lammps_commands_string', '_lammps_extract_setting', '_lammps_get_natoms', '_lammps_extract_global', '_lammps_extract_atom', '_lammps_extract_compute', '_lammps_extract_fix', '_lammps_extract_variable', '_lammps_set_variable', '_lammps_get_thermo', '_lammps_has_error', '_lammps_get_last_error_message']"
asm: obj web/js/lammps.js
wasm: obj web/js/lammpswasm.js
html: obj lammps.html

lammps.html: $(LAMMPS_OBJ_FILES)
	$(CXX) $(SYMBOLS) $(LD_FLAGS) -o $@ $^

web/js/lammps.js: $(LAMMPS_OBJ_FILES)
	$(CXX) $(SYMBOLS) $(LD_FLAGS) -o $@ $^
	mv web/js/lammps.js.mem web/lammps.js.mem

web/js/lammpswasm.js: $(LAMMPS_OBJ_FILES)
	$(CXX) -s WASM=1 $(SYMBOLS) $(LD_FLAGS) -o $@ $^
	mv web/js/lammpswasm.wasm web/lammpswasm.wasm

obj:
	mkdir -p obj

obj/%.o: lammps/src/%.cpp
	$(CXX) $(SYMBOLS) $(CC_FLAGS) $(INCLUDE_FLAGS) -c -o $@ $<

clean:
	rm web/js/lammps.js; rm web/js/lammpswasm.wasm; rm web/lammps.js.mem; rm web/lammpswasm.wasm; rm obj/*

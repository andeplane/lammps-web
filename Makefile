CXX = emcc
MAXMEMORY = 512MB

LAMMPS_SOURCE := $(wildcard lammps/src/*.cpp)
LAMMPS_OBJ_FILES := $(addprefix obj/,$(notdir $(LAMMPS_SOURCE:.cpp=.o)))

LD_FLAGS := -O3
CC_FLAGS := -O3 -DLAMMPS_EXCEPTIONS 
INCLUDE_FLAGS := -Ilammps/src/STUBS/ -Ilammps/src
SYMBOLS := -s ASSERTIONS=2 -s DISABLE_EXCEPTION_CATCHING=0 -s TOTAL_MEMORY=$(MAXMEMORY) -s EXPORTED_FUNCTIONS="['_runCommands', '_numberOfAtoms', '_reset', '_runDefaultScript', '_systemSizeX', '_systemSizeY', '_systemSizeZ', '_positions', '_x', '_v', '_f', '_active']"
lammpsjs: obj web/js/lammps.js

lammpshtml: obj lammps.html

lammps.html: $(LAMMPS_OBJ_FILES)
	$(CXX) $(SYMBOLS) $(LD_FLAGS) -o $@ $^

web/js/lammps.js: $(LAMMPS_OBJ_FILES)
	$(CXX) $(SYMBOLS) $(LD_FLAGS) -o $@ $^
	mv web/js/lammps.js.mem web/lammps.js.mem

obj:
	mkdir -p obj

obj/%.o: lammps/src/%.cpp
	$(CXX) $(SYMBOLS) $(CC_FLAGS) $(INCLUDE_FLAGS) -c -o $@ $<

clean:
	rm web/js/lammps.js; rm web/lammps.js.mem; rm obj/*

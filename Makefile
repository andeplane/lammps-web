CXX = emcc
MAXMEMORY = 128000000

LAMMPS_SOURCE := $(wildcard lammps/*.cpp)
LAMMPS_OBJ_FILES := $(addprefix obj/,$(notdir $(LAMMPS_SOURCE:.cpp=.o)))

LD_FLAGS := 
CC_FLAGS := -O3 
SYMBOLS := -s TOTAL_MEMORY=$(MAXMEMORY) -s EXPORTED_FUNCTIONS="['_runCommands', '_resetLammps', '_x', '_v', '_f', '_numberOfAtoms', '_systemSizeX', '_systemSizeY', '_systemSizeZ', '_positions']"

lammpsj: obj web/js/lammps.js

web/js/lammps.js: $(LAMMPS_OBJ_FILES)
	$(CXX) $(SYMBOLS) $(LD_FLAGS) -o $@ $^

obj:
	mkdir -p obj

obj/%.o: lammps/%.cpp
	$(CXX) $(SYMBOLS) $(CC_FLAGS) -I lammps -c -o $@ $<

clean:
	rm web/js/lammps.js; rm obj/*
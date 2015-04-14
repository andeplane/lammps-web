CXXWEB = emcc

LAMMPS_SOURCE := $(wildcard lammps/*.cpp)
LAMMPS_OBJ_FILES := $(addprefix obj/,$(notdir $(LAMMPS_SOURCE:.cpp=.o)))

LD_FLAGS := 
CC_FLAGS := -O3 
SYMBOLS := -s TOTAL_MEMORY=128000000 -s EXPORTED_FUNCTIONS="['_runCommands', '_checkInitialized', '_resetLammps', '_x', '_v', '_f', '_numberOfAtoms', '_systemSizeX', '_systemSizeY', '_systemSizeZ']"

web: obj lammps.js

lammps.js: $(LAMMPS_OBJ_FILES)
	$(CXX) $(LD_FLAGS) -o $@ $^

obj:
	mkdir -p obj

obj/%.o: lammps/%.cpp
	$(CXX) $(SYMBOLS) $(CC_FLAGS) -I lammps -c -o $@ $<

clean:
	rm lammps.js; rm obj/*
CXX = emcc

CPP_FILES := $(wildcard lammps/*.cpp)
OBJ_FILES := $(addprefix obj/,$(notdir $(CPP_FILES:.cpp=.o)))
LD_FLAGS := 
CC_FLAGS := -O3 
SYMBOLS := -s TOTAL_MEMORY=128000000 -s EXPORTED_FUNCTIONS="['_runCommands', '_checkInitialized', '_resetLammps', '_x', '_v', '_f', '_numberOfAtoms', '_systemSizeX', '_systemSizeY', '_systemSizeZ']"

lammps.js: $(OBJ_FILES)
	$(CXX) $(LD_FLAGS) -o $@ $^

obj/%.o: lammps/%.cpp
	$(CXX) $(SYMBOLS) $(CC_FLAGS) -I lammps -c -o $@ $<

clean:
	rm obj/*
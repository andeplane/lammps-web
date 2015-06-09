CXX = emcc
MAXMEMORY = 128000000

LAMMPS_SOURCE := $(wildcard lammps/src/*.cpp)
LAMMPS_OBJ_FILES := $(addprefix obj/,$(notdir $(LAMMPS_SOURCE:.cpp=.o)))

LD_FLAGS := -O3
CC_FLAGS := -O3 
INCLUDE_FLAGS := -Ilammps/src/STUBS/ -Ilammps/src
SYMBOLS := -s TOTAL_MEMORY=$(MAXMEMORY) -s EXPORTED_FUNCTIONS="['_runCommands', '_reset', '_runDefaultScript']"

lammpsjs: obj web/js/lammps.js

lammpshtml: obj lammps.html

lammps.html: $(LAMMPS_OBJ_FILES)
	$(CXX) $(SYMBOLS) $(LD_FLAGS) -o $@ $^

web/js/lammps.js: $(LAMMPS_OBJ_FILES)
	$(CXX) $(SYMBOLS) $(LD_FLAGS) -o $@ $^

obj:
	mkdir -p obj

obj/%.o: lammps/src/%.cpp
	$(CXX) $(SYMBOLS) $(CC_FLAGS) $(INCLUDE_FLAGS) -c -o $@ $<

clean:
	rm web/js/lammps.js; rm obj/*
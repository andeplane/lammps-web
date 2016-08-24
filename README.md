# Atomify LAMMPS Online
A web version of Atomify LAMMPS powered by Emscripten, Codemirror and three.js.

## What is LAMMPS? ##
LAMMPS ([lammps.sandia.gov](http://lammps.sandia.gov), [github.com/lammps/lammps](https://github.com/lammps/lammps)) is a high performance molecular dynamics code written in c++. It is an acronym for Large-scale Atomic/Molecular Massively Parallel Simulator. With [Emscripten](http://kripken.github.io/emscripten-site/), an LLVM-to-JavaScript Compiler, it isn't too hard to compile LAMMPS into asm.js (a subset of Javascript) so it can run in any browser.

## What is Atomify LAMMPS? ##
Atomify LAMMPS ([ovilab.net/atomify](http://ovilab.net/projects/atomify-lammps/), [github.com/computationalphysics/atomify-lammps](https://github.com/computationalphysics/atomify-lammps)) is an editor for LAMMPS with realtime visualization of atom positions and live plotting of physical quantities. 

## Requirements ##
To run the precompiled version, you only need a simple web server. An example is i.e. [Node.js](https://nodejs.org/en/) and the server.js file in the web directory. See instructions below.

## How to run using Node.js ##
A precompiled version is already in the web directory. 
* Install [Node.js](https://nodejs.org/en/)
* Open the web directory in a terminal 
* Install connect and serve-static with
`npm install connect`
`npm install serve-static`
* Start server with
`node server.js`
* Open [http://127.0.0.1:8080](http://127.0.0.1:8080)

## Build instructions ##
You will need the [Emscripten](http://kripken.github.io/emscripten-site/) compiler (instructions in the link). Once you have that, just open the directory containing this README.md file and run
`python setup.py install`
This will clone LAMMPS from [github.com/lammps/lammps](https://github.com/lammps/lammps), compile it and copy the new version of LAMMPS into the web directory. 
/* ----------------------------------------------------------------------
   LAMMPS - Large-scale Atomic/Molecular Massively Parallel Simulator
   http://lammps.sandia.gov, Sandia National Laboratories
   Steve Plimpton, sjplimp@sandia.gov
   
   Copyright (2003) Sandia Corporation.  Under the terms of Contract
   DE-AC04-94AL85000 with Sandia Corporation, the U.S. Government retains
   certain rights in this software.  This software is distributed under
   the GNU General Public License.
   
   See the README file in the top-level LAMMPS directory.
------------------------------------------------------------------------- */
#include <cstring>
#include <iostream>
#include <sstream>
#include <vector>
#include <cstring>

#include <fix_atomify.h>
#include <atom.h>
#include <modify.h>
#include <domain.h>
#include <lammps.h>
#include <library.h>
#include <input.h>

using namespace LAMMPS_NS;
using namespace std;

typedef void (*FnPtr)(void *, int);
FnPtr callback;
LAMMPS *lammps = 0;

extern "C" {
void* reset() {
    if(lammps) {
        lammps_close((void*)lammps);
        lammps = 0;
    }
    lammps_open_no_mpi(0, 0, (void**)&lammps);
    return lammps;
}

void addAtomifyFix()
{
    if(!lammps) {
        printf("Error, could not add fix atomify since LAMMPS object is not created");
        exit(0);
    }

    lammps_command(lammps, "fix atomify all atomify");
    
    LAMMPS_NS::LAMMPS *lmp = static_cast<LAMMPS_NS::LAMMPS *>(lammps);
    int ifix = lmp->modify->find_fix("atomify");
    if (ifix < 0) {
        printf("Error, could not create fix atomify");
        exit(1);
    }
    LAMMPS_NS::FixAtomify *fix = static_cast<LAMMPS_NS::FixAtomify*>(lmp->modify->fix[ifix]);
    fix->set_callback(callback, nullptr);
}

void setCallback(FnPtr cb) {
    callback = cb;
}

int numberOfAtoms() {
    return lammps_get_natoms(lammps);
}

bool active() {
    return lammps != 0;
}

double systemSizeX() {
    return lammps->domain->xprd;
}

double systemSizeY() {
    return lammps->domain->yprd;
}

double systemSizeZ() {
    return lammps->domain->zprd;
}

double *positions() {
    double **x = (double**)lammps_extract_atom((void*)lammps, "x");
    return x[0];
}

double **x() {
    return (double**)lammps_extract_atom((void*)lammps, "x");
}

double **v() {
    return (double**)lammps_extract_atom((void*)lammps, "v");
}

double **f() {
    return (double**)lammps_extract_atom((void*)lammps, "f");
}

void runCommands(char *commands) {
    if(!lammps) {
        reset();
    }

    lammps_commands_string((void*)lammps, commands);
}

void runDefaultScript() {
    char * defaultScript = 
        "# 3d Lennard-Jones melt\n"
        "variable    x index 1\n"
        "variable    y index 1\n"
        "variable    z index 1\n"
        "variable    xx equal 20*$x\n"
        "variable    yy equal 20*$y\n"
        "variable    zz equal 20*$z\n"
        "units       lj\n"
        "atom_style  atomic\n"
        "lattice     fcc 0.8442\n"
        "region      box block 0 ${xx} 0 ${yy} 0 ${zz}\n"
        "create_box  1 box\n"
        "create_atoms    1 box\n"
        "mass        1 1.0\n"
        "velocity    all create 1.44 87287 loop geom\n"
        "pair_style  lj/cut 2.5\n"
        "pair_coeff  1 1 1.0 1.0 2.5\n"
        "neighbor    0.3 bin\n"
        "neigh_modify    delay 0 every 20 check no\n"
        "fix     1 all nve\n"
        "run     10\n"
        "run     100\n";

    runCommands(defaultScript);
}

}

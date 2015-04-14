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
#include "atom.h"
#include "domain.h"
#include "mpi.h"
#include "lammps.h"
#include "library.h"
#include "input.h"
#include "string.h"

using namespace LAMMPS_NS;
using namespace std;
bool initialized = false;
LAMMPS *lammps = 0;

extern "C" {

void checkInitialized() {
    if(!initialized) {
        cout << "Creating LAMMPS object" << endl;
        lammps_open_no_mpi(0, 0, (void**)&lammps);
        initialized = true;
    } 
}

void resetLammps() {
    if(lammps) {
        lammps_close((void*)lammps);
        lammps = 0;
        initialized = false;
    }
}

void runCommands(const char *commands) {
    checkInitialized();

    std::stringstream ss(commands);
    std::string to;

    if (commands != NULL)
    {
        while(std::getline(ss,to,'\n')){
            cout << "Running command " << to << endl;
            lammps->input->one(to.c_str());
        }
    }
}

double **x() {
    return lammps->atom->x;
}

double **v() {
    return lammps->atom->v;
}

double **f() {
    return lammps->atom->f;
}

int numberOfAtoms() {
    return lammps->atom->natoms;
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

}

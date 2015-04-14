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
vector<double> positionsVector;

extern "C" {

void checkInitialized() {
    if(!initialized) {
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

double *positions(int particleIndex) {
    positionsVector.resize(lammps->atom->natoms);
    double pos[3];
    for(unsigned int i=0; i<lammps->atom->natoms; i++) {
        pos[0] = lammps->atom->x[particleIndex][0];
        pos[1] = lammps->atom->x[particleIndex][1];
        pos[2] = lammps->atom->x[particleIndex][2];
        lammps->domain->remap(pos);
        positionsVector[3*i+0] = pos[0];
        positionsVector[3*i+1] = pos[1];
        positionsVector[3*i+2] = pos[2];
    }

    return &positionsVector.front();
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

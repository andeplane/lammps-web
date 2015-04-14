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

LAMMPS *lammps = 0;

extern "C" {

void checkInitialized() {
  if(!lammps) {
    lammps_open_no_mpi(0, 0, (void**)&lammps);
  }
}

void resetLammps() {
    if(lammps) {
        lammps_close((void*)lammps);
        lammps = 0;
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

int numberOfAtoms() {
    return lammps->atom->natoms;
}

int systemSizeX() {
    return lammps->domain->xprd;
}

int systemSizeY() {
    return lammps->domain->yprd;
}

int systemSizeZ() {
    return lammps->domain->zprd;
}

}

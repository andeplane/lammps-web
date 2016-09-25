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

#include <error.h>
#include <atom.h>
#include <domain.h>
#include <lammps.h>
#include <library.h>
#include <input.h>
#include <emscripten/bind.h>
#include "lammpscontroller.h"

using namespace emscripten;

LAMMPSController::LAMMPSController() :
    m_currentException("")
{

}

void LAMMPSController::executeCommandInLAMMPS(std::string command) {
    char cmd[1000];
    std::strcpy(cmd, command.c_str());
    lammps_command((void*)m_lammps, cmd);
    char *lammpsError = m_lammps->error->get_last_error();
    if(lammpsError != NULL) {
        m_currentException =  LAMMPSException(lammpsError); // Store a copy of the exception to communicate to GUI
        m_exceptionHandled = false;
        m_state.crashed = true;
    }
}

void LAMMPSController::tick() {
    if(m_lammps == nullptr || m_state.crashed || m_state.paused) {
        return;
    }
}

void LAMMPSController::reset() {
    if(m_lammps) {
        lammps_close((void*)m_lammps);
        m_lammps = 0;
    }
    lammps_open_no_mpi(0, 0, (void**)&m_lammps);
    m_lammps->screen = NULL;
    m_state = State();
}

double** LAMMPSController::x() {
    if(!m_lammps) return nullptr;
    return m_lammps->atom->x;
}
// .function("lammps", &LAMMPSController::lammps, allow_raw_pointers())
// Binding code
EMSCRIPTEN_BINDINGS(lammpscontroller) {
  class_<LAMMPSController>("LAMMPSController")
    .constructor<>()
    .function("reset", &LAMMPSController::reset)
    .function("tick", &LAMMPSController::tick)
    .function("numberOfAtoms", &LAMMPSController::numberOfAtoms)
    .function("x", &LAMMPSController::x, allow_raw_pointers())
    ;
}

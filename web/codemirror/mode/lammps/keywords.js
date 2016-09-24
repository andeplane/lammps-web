var lammps_keywords = ('log write_restart restart dump undump thermo thermo_modify thermo_style print ' +
    'include read read_restart read_data ' +
    'boundary units atom_style lattice region create_box create_atoms dielectric ' +
    'delete_atoms change_box dimension replicate ' +
    'pair_coeff pair_style pair_modify mass velocity angle_coeff angle_style ' +
    'atom_modify atom_style bond_coeff bond_style delete_bonds kspace_style ' +
    'kspace_modify dihedral_style dihedral_coeff improper_style improper_coeff ' +
    'min_style fix_modify run_style timestep neighbor neigh_modify fix unfix ' +
    'communicate newton nthreads processors reset_timestep ' +
    'minimize run variable group compute ' +
    'jump next loop ' +
    'equal add sub mult div ' +
    'if then elif else EDGE NULL &').split(" ");

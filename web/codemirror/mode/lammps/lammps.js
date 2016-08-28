// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
// LAMMPS mode by Richard Berger
// Based on Shell mode

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode('lammps', function() {

  var words = {};
  function define_word_list(style, word_list) {
    for(var i = 0; i < word_list.length; i++) {
      words[word_list[i]] = style;
    }
  };

  function define(style, string) {
    var split = string.split(' ');
    define_word_list(style, split);
  };

  // Atoms
  define('atom', 'true false all no yes');

  // Keywords
  define('keyword', 'log write_restart restart dump undump thermo thermo_modify thermo_style print ' +
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
    'if then elif else EDGE NULL &');


  define('builtin', 'delay every check');

  define_word_list('builtin', lammps_pair_styles);
  define_word_list('builtin', lammps_fix_styles);
  define_word_list('builtin', lammps_compute_styles);
  define_word_list('builtin', lammps_dump_styles);

  function tokenBase(stream, state) {
    if (stream.eatSpace()) return null;

    var sol = stream.sol();
    var ch = stream.next();

    if (ch === '\\') {
      stream.next();
      return null;
    }
    if (ch === '\'' || ch === '"' || ch === '`') {
      state.tokens.unshift(tokenString(ch));
      return tokenize(stream, state);
    }
    if (ch === '#') {
      if (sol && stream.eat('!')) {
        stream.skipToEnd();
        return 'meta'; // 'comment'?
      }
      stream.skipToEnd();
      return 'comment';
    }
    if (ch === '$') {
      state.tokens.unshift(tokenDollar);
      return tokenize(stream, state);
    }
    if (ch === '+' || ch === '=') {
      return 'operator';
    }
    if (ch === '-') {
      stream.eat('-');
      stream.eatWhile(/\w/);
      return 'attribute';
    }
    if (/\d/.test(ch)) {
      stream.eatWhile(/[\d\.]/);
      if(stream.eol() || !/\w/.test(stream.peek())) {
        return 'number';
      }
    }
    stream.eatWhile(/[\w-\/]/);
    var cur = stream.current();
    if (stream.peek() === '=' && /[\w\/]+/.test(cur)) return 'def';
    return words.hasOwnProperty(cur) ? words[cur] : null;
  }

  function tokenString(quote) {
    return function(stream, state) {
      var next, end = false, escaped = false;
      while ((next = stream.next()) != null) {
        if (next === quote && !escaped) {
          end = true;
          break;
        }
        if (next === '$' && !escaped && quote !== '\'') {
          escaped = true;
          stream.backUp(1);
          state.tokens.unshift(tokenDollar);
          break;
        }
        escaped = !escaped && next === '\\';
      }
      if (end || !escaped) {
        state.tokens.shift();
      }
      return (quote === '`' || quote === ')' ? 'quote' : 'string');
    };
  };

  var tokenDollar = function(stream, state) {
    if (state.tokens.length > 1) stream.eat('$');
    var ch = stream.next(), hungry = /\w/;
    if (ch === '{') hungry = /[^}]/;
    if (ch === '(') {
      state.tokens[0] = tokenString(')');
      return tokenize(stream, state);
    }
    if (!/\d/.test(ch)) {
      stream.eatWhile(hungry);
      stream.eat('}');
    }
    state.tokens.shift();
    return 'def';
  };

  function tokenize(stream, state) {
    return (state.tokens[0] || tokenBase) (stream, state);
  };

  return {
    startState: function() {return {tokens:[]};},
    token: function(stream, state) {
      return tokenize(stream, state);
    },
    lineComment: '#',
    fold: "brace"
  };
});

CodeMirror.defineMIME('text/x-lammps', 'lammps');

});

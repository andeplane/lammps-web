// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
// LAMMPS hint by Richard Berger

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var Pos = CodeMirror.Pos;

  function forEach(arr, f) {
    for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
  }

  function arrayContains(arr, item) {
    if (!Array.prototype.indexOf) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === item) {
          return true;
        }
      }
      return false;
    }
    return arr.indexOf(item) != -1;
  }

  function scriptHint(editor, keywords, getToken, options) {
    // Find the token at the cursor
    var cur = editor.getCursor(), token = getToken(editor, cur);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;
    var context = [];

    if (token.state.command == 'fix') {

      switch(token.state.command_tokens.length) {
      case 1:
        // expect ident
        context.push('ident');
        break;

      case 2:
        // expect group name
        context.push('group');
        break; 

      case 3:
        // expect fix style name
        context.push('fix_style');
        break;
      }
    }

    if (token.state.command == 'pair_style') {
      switch(token.state.command_tokens.length) {
      case 1:
        // expect pair style name
        context.push('pair_style');
        break;
      }
    }


    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_\/]*$/.test(token.string)) {
      token = {start: cur.ch, end: cur.ch, string: "", state: token.state,
               type: token.string == "." ? "property" : null};
    } else if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    var tprop = token;
    // If it is a property, find out what it is a property of.
    while (tprop.type == "property") {
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (tprop.string != ".") return;
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (!context) var context = [];
      context.push(tprop);
    }
    return {list: getCompletions(token, context, keywords, options),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)};
  }

  function lammpsHint(editor, options) {
    return scriptHint(editor, lammps_keywords,
                      function (e, cur) {return e.getTokenAt(cur);},
                      options);
  };
  CodeMirror.registerHelper("hint", "lammps", lammpsHint);

  function getCompletions(token, context, keywords, options) {
    var found = [], start = token.string;

    function addLower(str) {
      if (str == str.toLowerCase()) found.push(str);
    }

    function maybeAdd(str) {
      if (str.indexOf(start) == 0) found.push(str);
    }

    function maybeAddLower(str) {
      if (str.indexOf(start) == 0) addLower(str);
    }    

    function gatherCompletions(obj) {
    }

    if (context && context.length) {
      // If this is a property, see if it belongs to some object we can
      // find in the current environment.
      var obj = context.pop();

      switch(obj) {
        case 'ident':
          return [];
        case 'group':
          if (start == '') {
            return token.state.groups;
          } else {
            forEach(token.state.groups, maybeAdd);
          }
          break;
        case 'fix_style':
          if (start == '') {
            forEach(lammps_fix_styles, addLower);
          } else {
            forEach(lammps_fix_styles, maybeAddLower);
          }
          break;
        case 'pair_style':
          if (start == '') {
            forEach(lammps_pair_styles, addLower);
          } else {
            forEach(lammps_pair_styles, maybeAddLower);
          }
          break;
      }

    } else {
      forEach(keywords, maybeAdd);
    }
    return found;
  }
});

(function(global, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory); // AMD
  } else if (typeof exports === 'object') {
    module.exports = factory(); // CommonJS
  } else {
    global.mova = factory(); // Globals
  }
}(this, function() {
  'use strict';

  var languages = {};
  var language;

  function argsToArray(args) {
    return Array.prototype.slice.call(args, 0);
  }

  function preparePath(parts) {
    parts = parts || [];
    var path = [];

    for (var i = 0; i < parts.length; i++) {
      path = path.concat(parts[i].split('.'));
    }

    return path;
  }

  function pathToString(path) {
    return path.join('.');
  }

  function resolvePath(tree, path, originalPath) {
    originalPath = originalPath || path;
    var node = tree[path[0]];

    switch (typeof node) {
      case 'string':
        return node;

      case 'object':
        var nextPath = path.slice(1);
        if (!nextPath.length) {
          return pathToString(originalPath);
        }

        return resolvePath(node, nextPath, originalPath);

      default:
        return pathToString(originalPath);
    }
  }

  function mova() {
    return resolvePath(language, preparePath(argsToArray(arguments)));
  }

  mova.addLanguages = function(newLanguages) {
    for (var key in Object.keys(newLanguages)) {
      languages[key] = newLanguages[key];
    }

    if (!language) {
      mova.setLanguage(Object.keys(languages)[0]);
    }
  };

  mova.setLanguage = function(key) {
    language = languages[key] || language;
  };

  mova.nameSpace = function() {
    var outerArgs = argsToArray(arguments);
    return function() {
      return mova(outerArgs, argsToArray(arguments));
    }
  };
}));

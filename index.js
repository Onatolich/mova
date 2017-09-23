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

    var nextPath = path.slice(1);
    if (node && nextPath.length) {
      return resolvePath(node, nextPath, originalPath);
    }

    switch (typeof node) {
      case 'string':
        return node;

      default:
        return pathToString(originalPath);
    }
  }

  function mova() {
    return resolvePath(language, preparePath(argsToArray(arguments)));
  }

  mova.addLanguages = function(newLanguages) {
    var keys = Object.keys(newLanguages);
    for (var i in keys) {
      languages[keys[i]] = newLanguages[keys[i]];
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
      return mova.apply(null, outerArgs.concat(argsToArray(arguments)));
    }
  };

  return mova;
}));

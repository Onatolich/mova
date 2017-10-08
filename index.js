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

  function assign(target, varArgs) {
    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  }

  function preparePath(parts) {
    parts = parts || [];
    var part;
    var path = [];
    var variables = {};

    for (var i = 0; i < parts.length; i++) {
      part = parts[i]
      if (typeof part === 'object') {
        variables = part;
        continue;
      }
      path = path.concat(part.split('.'));
    }

    return {
      variables: variables,
      path: path.join('.')
    };
  }

  function getTranslate(dict, data) {
    var result = dict[data.path];
    if (result) {
      return result.replace(/<=([a-z0-9]+)>/gi, function(_, match) {
        return data.variables[match] || _;
      });
    }

    return data.path;
  }

  function flatterDictionary(dict, path) {
    path = path || '';
    var node, nodePath;
    var result = {};
    var keys = Object.keys(dict);

    for (var i in keys) {
      node = dict[keys[i]];
      nodePath = keys[i];

      if (nodePath === '.') {
        nodePath = path;
      } else if (path) {
        nodePath = [path, nodePath].join('.');
      }

      switch (typeof node) {
        case 'string':
          result[nodePath] = node;
          break;
        case 'object':
          assign(result, flatterDictionary(node, nodePath));
          break;
      }
    }

    return result;
  }

  function languagePreprocessor(rawDict) {
    var dict = flatterDictionary(rawDict);
    var keys = Object.keys(dict);

    for (var i in keys) {
      dict[keys[i]] = dict[keys[i]]
        .replace(/<([a-z0-9.]+)>/gi, function(_, match) {
          return getTranslate(dict, { path: match });
        });
    }

    return dict;
  }

  function mova() {
    return getTranslate(language, preparePath(argsToArray(arguments)));
  }

  mova.addLanguages = function(newLanguages) {
    var keys = Object.keys(newLanguages);
    for (var i in keys) {
      languages[keys[i]] = languagePreprocessor(newLanguages[keys[i]]);
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

const constants = require('./constants');
const { resolvePath, isObject } = require('./utils');
const preCompile = require('./preCompile');

const mova = function(...input) {
  if (!mova.language) {
    throw new Error('Language pack should be defined before getting any translation!');
  }

  let params = {};
  if (isObject(input[input.length - 1])) {
    params = input.pop();
  }

  const pathArr = resolvePath(...input);
  if (!pathArr.length) {
    return '';
  }

  const path = pathArr.join('.');
  const fallbackPath = pathArr.slice(0, pathArr.length - 1).concat(constants.FALLBACK_KEY).join('.');

  const value = mova.language[path] || mova.language[fallbackPath];
  if (typeof value !== 'string') {
    return path;
  }

  return mova.interpolate(value, params, mova.interpolationFallback);
};

mova.interpolationFallback = '-';
mova.language = null;

mova.setLanguage = function setLanguage(language) {
  mova.language = preCompile(language);
};

mova.nameSpace = function nameSpace(...keys) {
  return (...innerKeys) => mova(...keys, ...innerKeys);
};
mova.ns = mova.nameSpace;

mova.interpolate = function interpolate(str, params, interpolationFallback) {
  return str.replace(/<=([a-z0-9]+)>/gi, function(_, match) {
    const value = params[match];
    if (['string', 'number'].includes(typeof value)) {
      return value;
    }
    return interpolationFallback || _;
  });
};

module.exports = mova;

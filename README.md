# mova
Powerful and fast runtime internationalization (i18n) utility without dependencies.

## Features
- Flexible and easy to use getting translations by paths
- Nesting translation branches
- Extending branches with `@extend` directive
- Defining branch fallbacks with `@any` directive
- Defining branch root with `@root` directive
- Reuse keys with in-translation `<[path]>` directive
- Interpolation with in-translation `<=[param]>` directive

## Installation
Using npm:
```sh
$ npm install mova
```

## API reference

#### `mova([...input])`

Returns translation for passed path. Path could be built with strings and 
arrays of strings. If the last argument is an object - it will be used as 
interpolation params object. Any other arguments will be ignored.

For example, all of this calls are equal:
```js
mova('k1.k2.k3.k4.k5', { param: 'value' });
mova('k1', 'k2', 'k3', 'k4', 'k5', { param: 'value' });
mova('k1', 'k2', ['k3'], 'k4.k5', { param: 'value' });
mova('k1', ['k2', ['k3', 'k4']], 'k5', { param: 'value' });
mova('k1', ['k2', ['k3', 'k4']], 'k5', { param: 'value' });
mova('.', null, 'k1', NaN, ['k2', 'k3.k4'], {}, 'k5', 10, { param: 'value' });
```

#### `mova.setLanguage(language)`

Accepts language pack and pre-compiles it for better runtime performance.

#### `mova.nameSpace([...input])`

Allows you to prepare language namespace for further usage.

For example, this call:
```js
const t = mova.nameSpace('k1', 'k2', 'k3');
t('k4', 'k5');
``` 
Equals to:
```js
mova('k1', 'k2', 'k3', 'k4', 'k5');
```

#### `mova.ns([...input])`

Alias for `mova.nameSpace` method.

#### `mova.interpolate(str, params, interpolationFallback)`

Allows you to interpolate passed params on passed string.
```js
mova.interpolate('key1: <=key1>', { key1: 'value 1' }); // -> key1: value 1
```

**interpolationFallback** arg allows to define fallback which will be used if no 
value passed for some param. If not specified - such params will not be interpolated.
```js
mova.interpolate('key1: <=key1>', {}, '-'); // -> key1: -
mova.interpolate('key1: <=key1>', {}); // -> key1: <=key1>
```

This method is used by `mova` main function for value interpolation.

#### `mova.interpolationFallback`
###### default: '-'

Interpolation fallback used by default. You can redefine it if necessary:
```js
mova.interpolationFallback = '[no value]';
```

## Language packs
To use `mova` for i18n you have to define language pack first.

Basically it's simple object with unlimited depth of nesting, like this:

```json
{
  "key1": "value 1",

  "branch": {
    "key1": "branch value 1",

    "innerBranch": {
      "key1": "inner branch value 1"
    }
  }
}
```

```js
mova('branch.key1'); // -> 'branch value 1'
```

Above example is very simple while real applications might need more 
complex solutions like extending branches, defining fallback translations, 
defining branch root translations, referencing other translations or interpolation.

For this purposes `mova` supports **directives**.

## Branch level directives

#### `@root` directive
Allows you to define root translation for specific branch.

```json
{
  "branch": {
    "@root": "Branch root"
  }
}
```

```js
mova('branch'); // -> 'Branch root'
```

###### NOTE
`@root` directive can not be used on translation root branch.

#### `@any` directive
Allows you to define a fallback translation for specific branch.

```json
{
  "branch": {
    "@any": "Branch fallback",
    "innerBranch": {}
  }
}
```

```js
mova('branch.unknown.key'); // -> 'Branch fallback'

// Also works for branch root path
mova('branch'); // -> 'Branch fallback'

// But does not work for existing inner branches
mova('branch.innerBranch.unknown.key'); // -> 'branch.innerBranch.unknown.key'
```

#### `@extends` directive

Allows you to extends existing branch. This directive accepts chaining, so if you 
will extend a branch that is extending another branch, your result branch will contain 
translations from both those branches.

```json
{
  "branch1": {
    "@root": "Branch root",
    "k1": "branch 1, value 1",
    "k2": "branch 1, value 2"
  },
  "branch2": {
    "@extends": "branch1",
    "k1": "branch 2, value 1"
  },
  "branch3": {
    "@extends": "branch2",
    "@root": "Branch 2 root"
  }
}
```

```js
mova('branch2'); // -> 'Branch root'
mova('branch2.k1'); // -> 'branch 2, value 1'
mova('branch2.k2'); // -> 'branch 1, value 2'
mova('branch3'); // -> 'Branch 2 root'
mova('branch3.k1'); // -> 'branch 2, value 1'
mova('branch3.k2'); // -> 'branch 1, value 2'
```

###### NOTE
`@extends` directive has some restrictions:
1. You can not extend any of parent branches.
2. You can not create circular extending, i.e. no branch can be both dependency 
and dependent at the same time for any other branch.

## In-translation directives

#### `<[path]>` directive

Allows you to reuse your translations. `[path]` should be replaced with absolute 
path to translation or relative path to current branch prepended with `.`

```json
{
  "k1": "root value 1",
  "branch": {
    "@root": "branch root",
    "k1": "branch value 1",
    "k2": "reference - <k1>",
    "k3": "reference - <.k1>",
    "k4": "reference - <.>"
  }
}
```

```js
mova('branch.k2'); // -> 'reference - root value 1'
mova('branch.k3'); // -> 'reference - branch value 1'
mova('branch.k4'); // -> 'reference - branch root'
```

#### `<=[param]>` directive (Interpolation)

Allows you to interpolate some values in your translations.
```json
{
  "k1": "<=key1>",
  "k2": "<k1> <=key2>"
}
```

```js
mova('k2', { key1: 'val1', key2: 'val2' }); // -> 'val1 val2'
mova('k2', { key1: 'val1' }); // -> 'val1 -'
```

In second example `<=key2>` param was replaced with `mova.interpolationFallback` value 
which is equal to `-` by default.

## Pre-compilation

`mova` will pre-compile passed language pack before using it to increase runtime 
translation performance.

So, for example, this language pack:

```json
{
  "k1": "value 1",
  "base": {
    "@root": "base root",
    "k3": "base value 3",
    "k4": "relative <.k1>"
  },
  "branch": {
    "@extends": "base",
    "@any": "branch fallback",
    "k1": "branch <k1>",
    "k2": "branch value 2 <=key>"
  }
}
```

Will be pre-compiled to this:

```json
{
  "k1": "value 1",
  "base": "base root",
  "base.k3": "base value 3",
  "base.k4": "relative base.k1",
  "branch": "base root",
  "branch.@any": "branch fallback",
  "branch.k1": "branch value 1",
  "branch.k2": "branch value 2 <=key>",
  "branch.k3": "base value 3",
  "branch.k4": "relative branch value 1"
}
```

So what happens during pre-compilation step:
1. Resolve `@extends` directives
2. Resolve in-translation `<[path]>` directives with respect to `@root` 
and `@any` directives
3. Resolve `@root` directives
4. Flatten language pack to single level object with compiled paths as keys

Because of this pre-compilation `mova` works very fast in runtime as its flow now very simple:
1. Join passed path parts with `.` separator
2. Try to find direct value for this path or fallback for its branch
3. Interpolate found value with passed named params

If no value will be found for passed path `mova` will return this path as result.

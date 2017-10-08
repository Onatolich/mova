# mova
Powerful and fast internationalization (i18n) utility.

## Installation
```sh
$ npm install mova
```

## Basic Usage
_en.json_
```json
{
  "common": {
    ".": "Common",
    "name": "Name",
    "surname": "Surname"
  },
  "fullName": "<common.name> and <common.surname>",
  "hello": "Hello, <=name>!"
}
```

_index.js_
```js
import en from './en.json';
import mova from 'mova';

// Add languages packs
mova.addLanguages({ en });

// Basic usage
console.log(mova('common.name')); // -> 'Name'
console.log(mova('fullName')); // -> 'Name and Surname'
console.log(mova('hello', { name: 'World' })); // -> 'Hello, World!'

// Index translation
console.log(mova('common')); // -> 'Common'

// Using namespaces
const t = mova.nameSpace('common');
console.log(t('surname')); // -> 'Surname'

// Change language
mova.setLanguage('ua');
```

## Cache and links
When you're adding a language pack mova caches it and resolves all links for maximum performance in runtime.

So, in fact, example language pack from above will be resolved to this:
```json
{
  "common.name": "Name",
  "common.surname": "Surname",
  "fullName": "Name and Surname"
}
```

## Paths
You can pass path different ways:
```js
mova('path.to.key') === mova('path', 'to.key') === mova('path', 'to', 'key')
```

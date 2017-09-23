# mova
Lightweight and simple internationalization (i18n) utility.

## Installation
```sh
$ npm install mova
```

## Usage
_en.json_
```json
{
  "common": {
    "login": "Login",
    "cancel": "Cancel"
  },
  "pages": {
    "Login": {
      "email": "Email",
      "password": "Password"
    }
  }
}
```

_index.js_
```js
import en from './en.json';
import mova from 'mova';

// Add languages packs
mova.addLanguages({ en });

// Basic usage
console.log(mova('common.login')); // -> 'Login'
console.log(mova('pages.Registration')); // -> 'pages.Registration'

// Create a namespace
const t = mova.nameSpace('pages.Login');
console.log(t('email')); // -> 'Email'

// Change language
mova.setLanguage('ua');
```

## Paths
You can pass path different ways:
```js
mova('path.to.key') === mova('path', 'to.key') === mova('path', 'to', 'key')
```

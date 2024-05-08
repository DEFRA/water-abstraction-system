'use strict'

const standard = require('eslint-config-standard')
const stylisticJs = require('@stylistic/eslint-plugin-js')

module.exports = [
  standard,
  {
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      '@stylistic/js/max-len': ['error', {
        code: 120
      }]
    }
  }
]

/*

This is the code to enforce agreed conventions

npm packages needed -
    "eslint-plugin-require-sort": "^1.3.0",
    "eslint-plugin-sort-keys": "^2.3.5",

module.exports = {
  extends: 'standard', // Maintain Standard.js rules
  // ignorePatterns: ['test/*'], // we can ignore patterns to allow to gradually enforce lints
  plugins: ['sort-keys', 'require-sort'],
  rules: {
    'func-style': ['error', 'declaration'],
    'max-len': ['error', {
      code: 120
    }],
    'require-sort/require-sort': 'error',
    'sort-keys': [
      'error', 'asc', { caseSensitive: false }
    ]
  }
}

*/

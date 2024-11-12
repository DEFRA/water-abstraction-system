'use strict'

const jsdoc = require('eslint-plugin-jsdoc')

module.exports = [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs"
    },
    plugins: {
      jsdoc
    },
    rules: {
      // Enforce braces around the function body of arrow functions
      "arrow-body-style": ["error", "always"],
      // Enforce 'use strict' declarations in all modules
      strict: ['error', 'global'],
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-indentation': 'warn',
      'jsdoc/check-types': 'warn',
      'jsdoc/check-tag-names': 'warn',
      'jsdoc/lines-before-block': 'warn',
      'jsdoc/newline-after-description': 'off', // does not work with 'use strict'
      'jsdoc/require-description': 'warn',
      'jsdoc/require-hyphen-before-param-description': 'warn',
      'jsdoc/require-jsdoc': ['warn', { publicOnly: true }],
      'jsdoc/require-param': ['warn', { exemptedBy: ['private'] }],
      'jsdoc/require-returns': ['warn', { publicOnly: true }]
    },
    settings: {
      jsdoc: {
        mode: 'jsdoc',
        ignorePrivate: true
      }
    }
  },
  // This section works as an override to the configuration object above. It tells jsdoc to ignore any files in the
  // `app/controllers` and `db/seeds` directories. The controllers purposefully do very little and the purpose of the
  // seed files is obvious
  {
    files: ['app/controllers/**/*', 'db/seeds/**/*'],
    rules: {
      'jsdoc/require-jsdoc': 'off'
    }
  }
]

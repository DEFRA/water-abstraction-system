'use strict'

module.exports = {
  extends: 'standard', // Maintain Standard.js rules
  ignorePatterns: ['docs/*'],
  overrides: [
    {
      files: ['*.controller.js', '*.seed.js'],
      rules: {
        'jsdoc/require-jsdoc': 'off'
      }
    }
  ],
  parserOptions: {
    sourceType: 'script'
  },
  plugins: [
    '@stylistic/js',
    'jsdoc'
  ],
  rules: {
    '@stylistic/js/arrow-parens': ['error', 'always'],
    '@stylistic/js/implicit-arrow-linebreak': ['off'],
    '@stylistic/js/max-len': ['error', {
      code: 120,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreUrls: true
    }],
    '@stylistic/js/padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'block' },
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: 'block', next: '*' },
      { blankLine: 'always', prev: 'block', next: 'function' },
      { blankLine: 'always', prev: 'function', next: '*' },
      // blank lines after every sequence of variable declarations
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      // blank lines after all directive prologues e.g. 'use strict'
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'any', prev: 'directive', next: 'directive' }
    ],
    'arrow-body-style': ['error', 'always'],
    'import/extensions': ['error', 'always'],
    strict: ['error', 'global'],
    'jsdoc/require-jsdoc': ['error', {
      publicOnly: true
    }],
    'jsdoc/require-description': 'error',
    'jsdoc/require-param': ['error', {
      exemptedBy: ['private']
    }],
    'jsdoc/require-returns': ['error', {
      publicOnly: true
    }],
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/newline-after-description': 'off', // does not work with 'use strict'
    'jsdoc/check-indentation': 'error',
    'jsdoc/lines-before-block': 'error',
    'jsdoc/check-types': 'error',
    'jsdoc/require-hyphen-before-param-description': 'error'
  },
  settings: {
    jsdoc: {
      mode: 'jsdoc',
      ignorePrivate: true
    }
  }
}

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

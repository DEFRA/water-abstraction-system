'use strict'

module.exports = {
  extends: 'standard', // Maintain Standard.js rules
  parserOptions: {
    sourceType: 'script'
  },
  plugins: [
    '@stylistic/js'
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
      { blankLine: 'always', prev: '*', next: 'expression' },
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: 'block', next: '*' },
      { blankLine: 'always', prev: 'block', next: 'function' },
      { blankLine: 'always', prev: 'expression', next: '*' },
      { blankLine: 'always', prev: 'function', next: '*' }
    ],
    'arrow-body-style': ['error', 'always'],
    'import/extensions': ['error', 'always'],
    strict: ['error', 'global']
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

module.exports = {
  extends: 'standard', // Maintain Standard.js rules
  plugins: [
    '@stylistic/js'
  ],
  rules: {
    '@stylistic/js/arrow-parens': ['error', 'always'],
    '@stylistic/js/max-len': ['error', {
      code: 120,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreUrls: true
    }],
    'import/extensions': ['error', 'always']
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

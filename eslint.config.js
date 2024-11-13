'use strict'

const stylisticPlugin = require('@stylistic/eslint-plugin-js')
const importPlugin = require('eslint-plugin-import')
const jsdocPlugin = require('eslint-plugin-jsdoc')
const nPlugin = require('eslint-plugin-n')
const promisePlugin = require('eslint-plugin-promise')
const globals = require('globals')

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      // Needed so ESlint knows it is checking Node code. For example, without it all uses of `console.log()` and
      // `process.env()` would be flagged by the 'no-undef' rule
      globals: {
        ...globals.node
      },
      sourceType: 'commonjs'
    },
    // Ignore the folder created when jsdocs are generated
    ignores: ['docs/**/*'],
    plugins: {
      '@stylistic/js': stylisticPlugin,
      import: importPlugin,
      jsdoc: jsdocPlugin,
      n: nPlugin,
      promise: promisePlugin
    },
    rules: {
      // Enforce braces around the function body of arrow functions
      'arrow-body-style': ['error', 'always'],
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
      'jsdoc/require-returns': ['warn', { publicOnly: true }],
      // Core ESLint StandardJS rules copied from https://github.com/standard/eslint-config-standard with Prettier
      // conflicting ones (checked via https://github.com/prettier/eslint-config-prettier) removed
      'no-var': 'warn',
      'object-shorthand': ['warn', 'properties'],
      'accessor-pairs': ['error', { setWithoutGet: true, enforceForClassMembers: true }],
      'array-callback-return': [
        'error',
        {
          allowImplicit: false,
          checkForEach: false
        }
      ],
      camelcase: [
        'error',
        {
          allow: ['^UNSAFE_'],
          properties: 'never',
          ignoreGlobals: true
        }
      ],
      'constructor-super': 'error',
      curly: ['error', 'all'],
      'default-case-last': 'error',
      'dot-notation': ['error', { allowKeywords: true }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'new-cap': ['error', { newIsCap: true, capIsNew: false, properties: true }],
      'no-array-constructor': 'error',
      'no-async-promise-executor': 'error',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-useless-backreference': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-eval': 'error',
      'no-ex-assign': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-implied-eval': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-iterator': 'error',
      'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
      'no-lone-blocks': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-prototype-builtins': 'error',
      'no-useless-catch': 'error',
      'no-multi-str': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-object': 'error',
      'no-new-symbol': 'error',
      'no-new-wrappers': 'error',
      'no-obj-calls': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',
      'no-proto': 'error',
      'no-redeclare': ['error', { builtinGlobals: false }],
      'no-regex-spaces': 'error',
      'no-return-assign': ['error', 'except-parens'],
      'no-self-assign': ['error', { props: true }],
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-this-before-super': 'error',
      'no-throw-literal': 'error',
      'no-undef': 'error',
      'no-undef-init': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true
        }
      ],
      'no-unused-vars': [
        'error',
        {
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          vars: 'all'
        }
      ],
      'no-use-before-define': ['error', { functions: false, classes: false, variables: false }],
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-constructor': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-void': 'error',
      'no-with': 'error',
      'one-var': ['error', { initialized: 'never' }],
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-promise-reject-errors': 'error',
      'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
      'spaced-comment': [
        'error',
        'always',
        {
          line: { markers: ['*package', '!', '/', ',', '='] },
          block: { balanced: true, markers: ['*package', '!', ',', ':', '::', 'flow-include'], exceptions: ['*'] }
        }
      ],
      'symbol-description': 'error',
      'unicode-bom': ['error', 'never'],
      'use-isnan': [
        'error',
        {
          enforceForSwitchCase: true,
          enforceForIndexOf: true
        }
      ],
      'valid-typeof': ['error', { requireStringLiterals: true }],
      yoda: ['error', 'never'],
      // Core ESLint StandardJS rules copied from https://github.com/standard/eslint-config-standard but updated because
      // it is using the deprecated version and configured not to conflict with our prettier set up
      '@stylistic/js/no-tabs': ['error', { allowIndentationTabs: true }],
      '@stylistic/js/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      // eslint-config-import StandardJS rules copied from https://github.com/standard/eslint-config-standard
      'import/export': 'error',
      'import/first': 'error',
      'import/no-absolute-path': ['error', { esmodule: true, commonjs: true, amd: false }],
      'import/no-duplicates': 'error',
      'import/no-named-default': 'error',
      'import/no-webpack-loader-syntax': 'error',
      // eslint-config-n StandardJS rules copied from https://github.com/standard/eslint-config-standard
      'n/handle-callback-err': ['error', '^(err|error)$'],
      'n/no-callback-literal': 'error',
      'n/no-deprecated-api': 'error',
      'n/no-exports-assign': 'error',
      'n/no-new-require': 'error',
      'n/no-path-concat': 'error',
      'n/process-exit-as-throw': 'error',
      // eslint-config-promise StandardJS rules copied from https://github.com/standard/eslint-config-standard
      'promise/param-names': 'error'
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

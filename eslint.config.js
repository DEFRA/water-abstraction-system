'use strict'

const jsdocPlugin = require('eslint-plugin-jsdoc')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const globals = require('globals')
const neostandard = require('neostandard')

module.exports = [
  // Start with neostandard ESLint rules. neostandard is the successor to StandardJS (which has stalled due to a
  // governance issue https://github.com/standard/standard/issues/1948#issuecomment-2138078249). The maintainers of
  // neostandard have opted to lean into ESLint rather than follow the ethos of a standalone tool.
  //
  // So, it might be better to think of it as superseding eslint-config-standard. But unlike that package and its
  // issues, neostandard is built for ESLint 9, so supports the new flat-file config and uses @stylistic/eslint-plugin
  // for style rules rather than the deprecated ES Core ones.
  //
  // It also acknowledges current ways of working. For example, you can now enforce instead of ban semi colons using an
  // option (the only blocker to some people using StandardJS in the past). It also acknowledges that many projects,
  // like ours, want to apply StandardJS code rules, but leave the formatting to Prettier. Hence, you can now deactivate
  // its style rules with the `noStyle` option.
  //
  // We add it first, so if anything we do conflicts with the StandardJS rules, our customisations take precedence.
  // https://github.com/neostandard/neostandard
  ...neostandard({ noStyle: true }),
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
    // Ignore the folder created when JSDocs are generated
    ignores: ['docs/**/*'],
    plugins: {
      // https://github.com/gajus/eslint-plugin-jsdoc
      jsdoc: jsdocPlugin,
      import: neostandard.plugins['import-x']
    },
    // NOTE: Special case for arrow-body-style below
    rules: {
      // Enforce .js extension when requiring files
      'import/extensions': ['error', 'always'],
      // Enforce 'use strict' declarations in all modules
      strict: ['error', 'global'],
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/lines-before-block': 'error',
      'jsdoc/newline-after-description': 'off', // does not work with 'use strict'
      'jsdoc/require-description': 'error',
      'jsdoc/require-hyphen-before-param-description': 'error',
      'jsdoc/require-jsdoc': ['error', { publicOnly: true }],
      'jsdoc/require-param': ['error', { exemptedBy: ['private'] }],
      'jsdoc/require-returns': ['error', { publicOnly: true }]
    },
    settings: {
      jsdoc: {
        mode: 'jsdoc',
        ignorePrivate: true
      }
    }
  },
  // This section works as an override to the configuration object above. It tells the jsdoc plugin to ignore any files
  // in the `app/controllers` and `db/seeds` directories. The controllers purposefully do very little and the purpose of
  // the seed files is obvious
  {
    files: ['app/controllers/**/*', 'db/seeds/**/*'],
    rules: {
      'jsdoc/require-jsdoc': 'off'
    }
  },
  // This section adds another override to the configuration object above. It tells the import/extensions plugin to
  // ignore this file. The plugin flags `eslint-plugin-prettier/recommended` as a violation, even though it is not and
  // adding `.js` causes it to break
  {
    files: ['eslint.config.js'],
    rules: {
      'import/extensions': 'off'
    }
  },
  // Adds prettier ESLint rules. It automatically sets up eslint-config-prettier, which turns off any rules declared
  // above that conflict with prettier. That shouldn't be any, as we tell neostandard not to include any style rules
  // and the ones we've declared we've done as per eslint-config-prettier docs on special rules. As recommended by
  // eslint-plugin-prettier, we declare this config last ... _almost_!
  // https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-new-eslintconfigjs
  eslintPluginPrettierRecommended,
  // Normally this would be declared with the rest of the rules above. However, there is a known issue with
  // eslint-plugin-prettier and the arrow-body-style rule. In _some_ cases, use of ESLint's autofix will result in code
  // that prettier will deem invalid. There is no fix for this, so the plugin folks avoid the issue by disabling the
  // rule. This means to get it back, we have to declare it _after_ the config eslint-plugin-prettier applies.
  {
    rules: {
      // Enforce braces around the function body of arrow functions
      'arrow-body-style': ['error', 'always']
    }
  }
]

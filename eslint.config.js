import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import neostandard from 'neostandard'

import noMixedExports from './eslint-rules/no-mixed-exports.js'

export default [
  // Ignore the folder created when JSDocs are generated
  // NOTE: In an ESLint Flat Config, an object is only treated as a Global Ignore if it contains the ignores key and
  // nothing else.
  {
    ignores: ['docs/**/*']
  },
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
      sourceType: 'module'
    },
    plugins: {
      // https://github.com/gajus/eslint-plugin-jsdoc
      jsdoc: jsdocPlugin,
      import: neostandard.plugins['import-x'],
      local: { rules: { 'no-mixed-exports': noMixedExports } }
    },
    // NOTE: Special case for arrow-body-style below
    rules: {
      // Enforce .js extension when importing local files; ignore bare package specifiers (e.g. 'dotenv/config')
      'import/extensions': ['error', 'always', { ignorePackages: true }],
      // A file must use one export style only: either a single default export, or one or more named exports, never both
      'local/no-mixed-exports': 'error',
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
      'jsdoc/require-returns': ['error', { publicOnly: true }],
      // Enforce `import * as X` before `import X` before `import { x }`, alphabetically sorted within each group.
      // allowSeparatedGroups lets us keep the "Test helpers" / "Thing under test" blocks independently sorted
      'sort-imports': [
        'error',
        { memberSyntaxSortOrder: ['all', 'single', 'multiple', 'none'], allowSeparatedGroups: true }
      ],
      // Group external imports (Node builtins and node_modules packages) before internal (relative path) imports,
      // with a blank line between the two groups
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index']
          ],
          'newlines-between': 'always'
        }
      ],
      // Require a blank line after the last import statement, separating imports from the rest of the file
      'import/newline-after-import': 'error'
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
    files: ['app/controllers/**/*', 'db/seeds/**/*', 'db/migrations/**/*'],
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
  // Test files use blank lines to separate "Test helpers" / "Things we need to stub" / "Thing under test" blocks,
  // a different convention to external-vs-internal grouping, so exempt them from import/order
  {
    files: ['templates/*.test.js', 'test/**/*'],
    rules: {
      'import/order': 'off'
    }
  },
  // This file deliberately separates its two imports with a large explanatory comment, which import/order treats as
  // a disallowed blank line within the group
  {
    files: ['knexfile.application.js'],
    rules: {
      'import/order': 'off'
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

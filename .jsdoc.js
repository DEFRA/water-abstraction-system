'use strict'

module.exports = {
  // Some of these are exposed via the command line. Specifying them here means we only need to pass this conf file
  // as an argument to jsdoc on the command line.
  opts: {
    // Defaults to UTF8 but we are just being explicit
    encoding: 'utf8',
    // We output the generated documentation to `docs/` instead of `out/` (the default)
    destination: 'docs/',
    // Treat errors as fatal errors, and treat warnings as errors
    // NOTE: We seem to get a 1 (error) exit code if there is a parsing issue irrespective of how this is set. Reading
    // into the code, this appears to be for tools that hook into JSDoc's event emitters rather than the command line.
    pedantic: true,
    // The README to present on the documentation home page. In lieu of anything else we give it the project's README
    readme: 'README.md',
    // Whether to recurse into subdirectories
    recurse: true,
    // Log detailed information to the console when JSDoc runs. This allows us to track down errors
    verbose: true
  },
  // JSDoc plugins to load
  plugins: [
    // Supports converting the Markdown text in our comments to HTML in the documentation
    'plugins/markdown',
    // Removes all symbols that begin with an underscore from the doc output. This saves us having to comment all
    // our private methods with a @private tag
    'plugins/underscore'
  ],
  // Having enabled recurse in our options, we also need to tell JSDoc how deep to go
  recurseDepth: 10,
  source: {
    include: ['./app'],
    includePattern: '.js$',
    excludePattern: '(db/|docs/|node_modules/|test/)'
  },
  // The type of source file. JSDoc recommends you use the value `module` unless none of your code files use ECMAScript
  // >=2015 syntax
  sourceType: 'module',
  // Settings for interpreting JSDoc tags
  tags: {
    // We want JSDoc to error if it encounters an unknown tag
    allowUnknownTags: false,
    // We don't use the closure syntax so only expect to encounter tags from the JSDoc dictionary
    dictionaries: ['jsdoc']
  },
  // Settings for generating output with JSDoc templates
  templates: {
    // Set to `true` to use a monospaced font for links to other code symbols, but not links to websites
    cleverLinks: true,
    // Set to `false` so we don't use a monospaced font for all links
    monospaceLinks: false
  }
}

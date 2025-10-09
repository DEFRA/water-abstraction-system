'use strict'

/**
 * Converts Notify's custom flavour of markdown into valid HTML. Notify's flavour of markdown uses a caret (`^`)
 * character to represent blockquotes. This function replaces any carets (`^`) with the standard blockquote marker (`>`)
 * for correct rendering when processed by the `marked` library.
 *
 * The regular expression `/\^/gm` looks for all instances of the caret character globally (`g` flag) and across
 * multiple lines (`m` flag). Each caret is then replaced by a `>` character, which is the correct symbol for
 * blockquotes in standard markdown.
 *
 * If the input is:
 * ```
 * ^ This is a blockquote
 * ^ Another blockquote
 * ```
 *
 * The function will replace the carets (`^`) with greater-than symbols (`>`), resulting in:
 * ```
 * > This is a blockquote
 * > Another blockquote
 * ```
 *
 * This processed string is then parsed into HTML using the `marked` library.
 *
 * @param {string} input - The markdown input to be processed.
 * @returns {string} The HTML output generated after replacing carets (`^`) with `>` and parsing the markdown.
 */
function markdown(input = '') {
  const marked = _importMarked()

  const replacedCaret = input.replace(/\^/gm, '>')

  return marked.parse(replacedCaret)
}

/**
 * Admittedly, we can't find any specific reference to the change in marked's release notes. But since we brought in
 * v16.4.0 some team members have reported seeing the error `Error [ERR_REQUIRE_ESM]: require() of ES Module` when
 * attempting to start the app locally.
 *
 * So, we follow a pattern we've used in `app/requests/base.request.js` for importing Got, another package we know
 * shifted to only supporting ESM.
 *
 * @private
 */
function _importMarked() {
  const { marked } = import('marked')

  return marked
}

module.exports = {
  markdown
}

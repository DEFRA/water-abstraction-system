'use strict'

/**
 * Generates a template string of html for the return form
 * @module GenerateReturnFormService
 */

const nunjucks = require('nunjucks')
const path = require('path')

/**
 * Renders a Nunjucks template asynchronously and returns the resulting HTML.
 *
 * THis function adapted from `water-abstraction-service` helper function 'createHtmlFromTemplate'. Which wraps
 * `nunjucksEnv.render` in a Promise to make it easier to use with async/await.
 *
 * @param {object} data - The context data to pass to the template.
 *
 * @returns {Promise<string>} Resolves with the rendered HTML string.
 * @private
 */
function go(data) {
  const view = 'preview-return-forms.njk'

  const nunjucksEnv = nunjucks.configure(path.resolve(__dirname, '../../../views/notices/pdfs/'), { autoescape: true })

  return new Promise((resolve, reject) => {
    nunjucksEnv.render(view, data, (err, result) => {
      return err ? reject(err) : resolve(result)
    })
  })
}

module.exports = {
  go
}

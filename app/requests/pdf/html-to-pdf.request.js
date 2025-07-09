'use strict'

/**
 * Send a html to convert to a pdf
 * @module HTMLtoPDFRequest
 */

const FormData = require('form-data')
const nunjucks = require('nunjucks')
const path = require('path')

const HTMLToPDFRequest = require('../html-to-pdf.request.js')

const nunjucksEnv = nunjucks.configure(path.resolve(__dirname), { autoescape: true })

/**
 *
 * @param req
 * @param res
 */
async function go(req, res) {
  try {
    const template = 'preview-paper-form.njk'

    // this lives in the service
    const htmlContent = await createHtmlFromTemplate(template, {})

    const form = new FormData()
    form.append('index.html', htmlContent, { filename: 'index.html' })

    form.append('marginTop', '0')
    form.append('marginBottom', '0')
    form.append('marginLeft', '0')
    form.append('marginRight', '0')
    form.append('preferCssPageSize', 'true')

    const data = await HTMLToPDFRequest.post('forms/chromium/convert/html', form)

    return data
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
}

// Helper function cribbed from `water-abstraction-service` to wrap nunjucksEnv.render in a promise so that calling it
// asyncronously is easier
function createHtmlFromTemplate(view, data) {
  return new Promise((resolve, reject) => {
    nunjucksEnv.render(view, data, (err, result) => {
      return err ? reject(err) : resolve(result)
    })
  })
}

module.exports = {
  go
}

'use strict'

/**
 * Sends multipart/form-data to Gotenberg for generating a PDF document
 * @module GenerateReturnFormRequest
 */

const nunjucks = require('nunjucks')
const path = require('path')

const GotenbergRequest = require('../gotenberg.request.js')

/**
 * Sends multipart/form-data to Gotenberg for generating a PDF document
 *
 * > Important - 'preferCssPageSize' tells Goetnberg to rely on our styling and to not add any default margin / padding.
 * > This is required in conjunction with setting 'marginTop' etc.
 *
 * @param {object} pageData - The data needed to populate and generate the PDF return form
 *
 * @returns {Promise<object>} An object representing the result of the request, including an ArrayBuffer as the 'body'
 */
async function send(pageData) {
  const htmlContent = await _generateHtmlContent(pageData)

  const formData = _generateFormData(htmlContent)

  return GotenbergRequest.post('forms/chromium/convert/html', formData)
}

function _generateFormData(htmlContent) {
  const formData = new FormData()

  formData.append('index.html', new Blob([Buffer.from(htmlContent)]), 'index.html')
  formData.append('marginTop', '0')
  formData.append('marginBottom', '0')
  formData.append('marginLeft', '0')
  formData.append('marginRight', '0')
  formData.append('preferCssPageSize', 'true')

  return formData
}

function _generateHtmlContent(data) {
  const view = 'preview-return-forms.njk'

  const nunjucksEnv = nunjucks.configure(path.resolve(__dirname, '../../views/notices/pdfs/'), { autoescape: true })

  return new Promise((resolve, reject) => {
    nunjucksEnv.render(view, data, (err, result) => {
      return err ? reject(err) : resolve(result)
    })
  })
}

module.exports = {
  send
}

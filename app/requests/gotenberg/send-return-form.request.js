'use strict'

/**
 * Creates and sends a html string to Gotenberg to convert it into a pdf
 * @module SendReturnFormRequest
 */

const FormData = require('form-data')

const GenerateReturnFormService = require('../../services/notices/setup/generate-return-form.service.js')
const GotenbergRequest = require('../gotenberg.request.js')

/**
 * Creates and sends a html string to Gotenberg to convert it into a pdf
 *
 * > Important - 'preferCssPageSize' tells Goetnberg to rely on our styling and to not add any default margin / padding.
 * > This is required in conjunction with setting 'marginTop' etc.
 *
 * @param {object} pageData
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the generated form file as an ArrayBuffer.
 */
async function send(pageData) {
  try {
    const htmlContent = await GenerateReturnFormService.go(pageData)

    const form = new FormData()
    form.append('index.html', htmlContent, { filename: 'index.html' })

    form.append('marginTop', '0')
    form.append('marginBottom', '0')
    form.append('marginLeft', '0')
    form.append('marginRight', '0')
    form.append('preferCssPageSize', 'true')

    return GotenbergRequest.post('forms/chromium/convert/html', form)
  } catch (error) {
    global.GlobalNotifier.omfg('Send return form failed', {}, error)

    return error
  }
}

module.exports = {
  send
}

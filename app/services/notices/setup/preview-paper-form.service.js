'use strict'

/**
 * Orchestrates fetching and presenting the data for the `notices/setup/{sessionId}/preview-paper-form` page
 *
 * @module PreviewPaperFormService
 */

const HTMLtoPDFRequest = require('../../../requests/pdf/html-to-pdf.request.js')
const PreviewPaperFormPresenter = require('../../../presenters/notices/setup/preview-paper-form.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `notices/setup/{sessionId}/preview-paper-form` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pdfBuffer = await HTMLtoPDFRequest.go()

  const pageData = PreviewPaperFormPresenter.go(session)

  // const filePath = Path.join(__dirname, 'example.pdf')
  //
  // if (!fs.existsSync(filePath)) {
  //   return null
  // }

  return pdfBuffer

  // return {
  //   ...pageData
  // }
}

module.exports = {
  go
}

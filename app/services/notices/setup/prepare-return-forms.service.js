'use strict'

/**
 * Orchestrates fetching and presenting the data for the return form
 *
 * @module PrepareReturnFormsService
 */

const GenerateReturnFormRequest = require('../../../requests/gotenberg/generate-return-form.request.js')
const PrepareReturnFormsPresenter = require('../../../presenters/notices/setup/preview-return-forms.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the return form
 *
 * @param {string} sessionId
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the generated form file as an ArrayBuffer.
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = PrepareReturnFormsPresenter.go(session)

  const requestData = await GenerateReturnFormRequest.send(pageData)

  return requestData.response.body
}

module.exports = {
  go
}

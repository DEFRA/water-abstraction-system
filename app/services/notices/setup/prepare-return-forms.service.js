'use strict'

/**
 * Orchestrates fetching and presenting the data for the return form
 *
 * @module PrepareReturnFormsService
 */

const GenerateReturnFormRequest = require('../../../requests/gotenberg/generate-return-form.request.js')
const PrepareReturnFormsPresenter = require('../../../presenters/notices/setup/prepare-return-forms.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the return form
 *
 * @param {module:SessionModel} session - The session instance
 * @param {string} returnId - The UUID of the return log
 * @param {object} recipient
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the generated form file as an ArrayBuffer.
 */
async function go(session, returnId, recipient) {
  const dueReturnLog = _dueReturnLog(session.dueReturns, returnId)

  const pageData = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

  const requestData = await GenerateReturnFormRequest.send(pageData)

  return requestData.response.body
}

function _dueReturnLog(dueReturns, returnId) {
  return dueReturns.find((dueReturn) => {
    return dueReturn.returnId === returnId
  })
}

module.exports = {
  go
}

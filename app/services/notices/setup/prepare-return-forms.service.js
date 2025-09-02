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
 * We return the 'pageData' to be used when sending the notification. The legacy code relies on setting the
 * personalisation in the database (mainly the address and due dates).
 *
 * @param {string} licenceRef
 * @param {object} dueReturnLog
 * @param {object} recipient
 *
 * @returns {Promise<{}>} - Resolves with the generated form file as an ArrayBuffer and the page data.
 */
async function go(licenceRef, dueReturnLog, recipient) {
  const pageData = PrepareReturnFormsPresenter.go(licenceRef, dueReturnLog, recipient)

  const requestData = await GenerateReturnFormRequest.send(pageData)

  return {
    file: requestData.response.body,
    pageData
  }
}

module.exports = {
  go
}

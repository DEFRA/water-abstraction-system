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
 * @param {string} licenceRef - The reference of the licence that the return log relates to
 * @param {object} dueReturnLog - The return log to populate the form data
 * @param {object} recipient - A single recipient with the contact / address
 *
 * @returns {Promise<{ArrayBuffer}>} - Resolves with the generated form file as an ArrayBuffer
 */
async function go(licenceRef, dueReturnLog, recipient) {
  const pageData = PrepareReturnFormsPresenter.go(licenceRef, dueReturnLog, recipient)

  const requestData = await GenerateReturnFormRequest.send(pageData)

  return requestData.response.body
}

module.exports = {
  go
}

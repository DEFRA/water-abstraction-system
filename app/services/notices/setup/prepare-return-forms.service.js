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
 * @param {object} notification - A return forms notification
 *
 * @returns {Promise<object>} - Resolves the response from the Gotenberg request wrapper
 */
async function go(notification) {
  const pageData = PrepareReturnFormsPresenter.go(notification)

  return GenerateReturnFormRequest.send(pageData)
}

module.exports = {
  go
}

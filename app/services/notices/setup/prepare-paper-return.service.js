'use strict'

/**
 * Orchestrates fetching and presenting the data for the paper return
 *
 * @module PreparePaperReturnService
 */

const GeneratePaperReturnRequest = require('../../../requests/gotenberg/generate-paper-return.request.js')
const PreparePaperReturnPresenter = require('../../../presenters/notices/setup/prepare-paper-return.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the paper return
 *
 * We return the 'pageData' to be used when sending the notification. The legacy code relies on setting the
 * personalisation in the database (mainly the address and due dates).
 *
 * @param {object} notification - A paper return notification
 *
 * @returns {Promise<object>} - Resolves the response from the Gotenberg request wrapper
 */
async function go(notification) {
  const pageData = PreparePaperReturnPresenter.go(notification)

  return GeneratePaperReturnRequest.send(pageData)
}

module.exports = {
  go
}

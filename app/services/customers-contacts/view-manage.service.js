'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/customers-contacts/{id}/manage' page
 *
 * @module ViewManageService
 */

const ViewManagePresenter = require('../../presenters/customers-contacts/view-manage.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/customers-contacts/{id}/manage' page
 *
 * @param {string} id - the UUID of the customer contact
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id) {
  const pageData = ViewManagePresenter.go()

  return {
    ...pageData
  }
}

module.exports = {
  go
}

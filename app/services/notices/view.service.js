'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @module ViewService
 */

const ViewPresenter = require('../../presenters/notices/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'notices/{id}' page
 *
 * @param {string} noticeId - The uuid of the notice we are viewing
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(noticeId, page) {
  const pageData = ViewPresenter.go()

  return {
    ...pageData
  }
}

module.exports = {
  go
}

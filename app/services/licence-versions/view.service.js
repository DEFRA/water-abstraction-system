'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/licence-versions/{id}` page
 *
 * @module ViewService
 */

const ViewPresenter = require('../../presenters/licence-versions/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the `/licence-versions/{id}` page
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go() {
  const pageData = ViewPresenter.go()

  return {
    ...pageData
  }
}

module.exports = {
  go
}

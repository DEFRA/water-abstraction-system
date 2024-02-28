'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/site-description` page
 * @module SiteDescriptionService
 */

const SessionModel = require('../../models/session.model.js')
const SiteDescriptionPresenter = require('../../presenters/return-requirements/site-description.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/site-description` page
 *
 * Supports generating the data needed for the site description page in the return requirements setup journey. It fetches the
 * current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The id of the current session
 *
 * @returns {Promise<Object>} The view data for the site description page
*/
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = SiteDescriptionPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Enter a site description for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}

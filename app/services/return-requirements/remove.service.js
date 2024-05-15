'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/remove/{requirementIndex}` page
 * @module RemoveService
 */

const RemovePresenter = require('../../presenters/return-requirements/remove.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/remove/{requirementIndex}` page
 *
 * Supports generating the data needed for the remove requirements page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being removed
 *
 * @returns {Promise<Object>} The view data for the remove requirements page
*/
async function go (sessionId, requirementIndex) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = RemovePresenter.go(session, requirementIndex)

  return {
    activeNavBar: 'search',
    pageTitle: 'You are about to remove these requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}

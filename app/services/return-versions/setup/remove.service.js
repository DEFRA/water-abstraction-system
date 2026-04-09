'use strict'

/**
 * Orchestrates fetching and presenting the data for
 * `/return-versions/setup/{sessionId}/remove/{requirementIndex}` page
 * @module RemoveService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const RemovePresenter = require('../../../presenters/return-versions/setup/remove.presenter.js')

/**
 * Orchestrates fetching and presenting the data for
 * `/return-versions/setup/{sessionId}/remove/{requirementIndex}` page
 *
 * Supports generating the data needed for the remove requirements page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being removed
 *
 * @returns {Promise<object>} The view data for the remove requirements page
 */
async function go(sessionId, requirementIndex) {
  const session = await FetchSessionDal.go(sessionId)
  const formattedData = RemovePresenter.go(session, requirementIndex)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}

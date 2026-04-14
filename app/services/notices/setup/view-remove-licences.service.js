'use strict'

/**
 * Orchestrates fetching and presenting the licences to remove for the notices setup remove licences page
 * @module ViewRemoveLicencesService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const RemoveLicencesPresenter = require('../../../presenters/notices/setup/remove-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the licences to remove for the notices setup remove licences page
 *
 * @param {string} sessionId - The UUID for setup returns notice session record
 *
 * @returns {Promise<object>} The view data for the remove licences page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const { removeLicences = [] } = session

  const formattedData = RemoveLicencesPresenter.go(removeLicences, session)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}

module.exports = {
  go
}

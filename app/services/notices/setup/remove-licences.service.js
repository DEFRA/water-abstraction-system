'use strict'

/**
 * Orchestrates fetching and presenting the licences to remove for the notices setup remove licences page
 * @module RemoveLicencesService
 */

const RemoveLicencesPresenter = require('../../../presenters/notices/setup/remove-licences.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the licences to remove for the notices setup remove licences page
 *
 * @param {string} sessionId - The UUID for setup returns notice session record
 *
 * @returns {object} The view data for the remove licences page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { removeLicences = [] } = session

  const formattedData = RemoveLicencesPresenter.go(removeLicences, session.referenceCode)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

module.exports = {
  go
}

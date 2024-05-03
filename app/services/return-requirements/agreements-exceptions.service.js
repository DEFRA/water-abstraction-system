'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/agreements-exceptions` page
 * @module AgreementExceptionService
 */

const AgreementsExceptionsPresenter = require('../../presenters/return-requirements/agreements-exceptions.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/agreements-exceptions` page
 *
 * Supports generating the data needed for the agreements and exceptions page in the return requirements setup journey.
 * It fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<Object>} The view data for the agreements and exceptions page
*/
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = AgreementsExceptionsPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select agreements and exceptions for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}

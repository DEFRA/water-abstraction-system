'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/abstraction-period` page
 * @module AbstractionPeriodService
 */

const AbstractionPeriodPresenter = require('../../../presenters/return-versions/setup/abstraction-period.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/abstraction-period` page
 *
 * Supports generating the data needed for the abstraction period page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the abstraction period page
 */
async function go(sessionId, requirementIndex) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = AbstractionPeriodPresenter.go(session, requirementIndex)

  return {
    activeNavBar: 'search',
    pageTitle: 'Enter the abstraction period for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}

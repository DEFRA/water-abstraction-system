'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/setup/{sessionId}/points` page
 * @module PointsService
 */

const FetchPointsService = require('./fetch-points.service.js')
const PointsPresenter = require('../../../presenters/return-requirements/setup/points.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/setup/{sessionId}/points` page
 *
 * Supports generating the data needed for the points page in the return requirements setup journey. It fetches the
 * current session record and combines it with the checkboxes and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the points page
 */
async function go (sessionId, requirementIndex) {
  const session = await SessionModel.query().findById(sessionId)
  const points = await FetchPointsService.go(session.licence.id)

  const formattedData = PointsPresenter.go(session, requirementIndex, points)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the points for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}

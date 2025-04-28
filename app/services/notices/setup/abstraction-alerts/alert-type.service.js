'use strict'

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alert/alert-type` page
 *
 * @module AlertTypeService
 */

const AlertTypePresenter = require('../../../../presenters/notices/setup/abstraction-alerts/alert-type.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/abstraction-alert/alert-type` page
 *
 * @param {string} sessionId
 * @returns {object} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = AlertTypePresenter.go(session)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}

'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/abstraction-alerts/contact-type` page
 *
 * @module ContactTypeService
 */

const ContactTypePresenter = require('../../../../presenters/notices/setup/abstraction-alerts/contact-type.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ContactTypePresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}

'use strict'

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @module SubmitCheckLicenceMatchesService
 */

const CheckLicenceMatchesPresenter = require('../../../../presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates saving the data for the `/notices/setup/{sessionId}/abstraction-alerts/check-licence-matches` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = CheckLicenceMatchesPresenter.go(session)

  await _save(session, pageData)
}

async function _save(session, pageData) {
  const relevantLicenceRefs = pageData.restrictions.map((restriction) => {
    return restriction.licenceRef
  })

  session.licenceRefs = Array.from(new Set(relevantLicenceRefs))

  return session.$update()
}

module.exports = {
  go
}

'use strict'

/**
 * Orchestrates fetching and presenting the requirements for the check page
 * @module RequirementsService
 */

const FetchPurposesByIdsService = require('./fetch-purposes.service.js')
const ReturnRequirementsPresenter = require('./returns-requirements.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the requirements for `/return-requirements/{sessionId}/check` page
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { requirements, journey } = session
  const purposeIds = _purposeIds(requirements)
  const purposes = await FetchPurposesByIdsService.go(purposeIds)

  return ReturnRequirementsPresenter.go(requirements, purposes, journey)
}

function _purposeIds (requirements) {
  const requirementPurposes = requirements.flatMap((requirement) => {
    if (requirement.purposes) {
      return requirement.purposes
    }

    return []
  })

  //  Duplicate is a bug this is temp
  return [...new Set(requirementPurposes)]
}

module.exports = {
  go
}

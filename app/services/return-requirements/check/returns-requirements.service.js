'use strict'

/**
 * Orchestrates fetching and presenting the return requirements for the check page
 * @module ReturnRequirementsService
 */

const ReturnRequirementsPresenter = require('../../../presenters/return-requirements/check/returns-requirements.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const PurposeModel = require('../../../models/purpose.model.Js')

/**
 * Orchestrates fetching and presenting the return requirements for `/return-requirements/{sessionId}/check` page
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { requirements, journey } = session
  const purposeIds = _purposeIds(requirements)
  const purposes = await _fetchPurposeIds(purposeIds)

  return ReturnRequirementsPresenter.go(requirements, purposes, journey)
}

function _purposeIds (requirements) {
  const requirementPurposes = requirements.flatMap((requirement) => {
    if (requirement.purposes) {
      return requirement.purposes
    }

    return []
  })

  return [...new Set(requirementPurposes)]
}

async function _fetchPurposeIds (purposeIds) {
  return PurposeModel.query()
    .select([
      'purposes.id',
      'purposes.description'
    ])
    .findByIds(purposeIds)
}

module.exports = {
  go
}

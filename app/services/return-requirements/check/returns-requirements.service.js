'use strict'

/**
 * Orchestrates fetching and presenting the return requirements for the check page
 * @module ReturnRequirementsService
 */

const PurposeModel = require('../../../models/purpose.model.js')
const ReturnRequirementsPresenter = require('../../../presenters/return-requirements/check/returns-requirements.presenter.js')

/**
 * Orchestrates fetching and presenting the return requirements for `/return-requirements/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The session for the return requirement journey
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (session) {
  const { requirements, journey } = session.data

  const purposeIds = _purposeIds(requirements)
  const purposes = await _fetchPurposes(purposeIds)

  return ReturnRequirementsPresenter.go(requirements, purposes, journey)
}

async function _fetchPurposes (purposes) {
  return PurposeModel.query()
    .select([
      'purposes.id',
      'purposes.description'
    ])
    .findByIds(purposes)
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

module.exports = {
  go
}

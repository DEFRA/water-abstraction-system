'use strict'

/**
 * Orchestrates fetching and presenting the return requirements for the check page
 * @module ReturnRequirementsService
 */

const FetchPointsService = require('../fetch-points.service.js')
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
  const { licence, data: { requirements, journey } } = session

  const points = await FetchPointsService.go(licence.id)
  const purposeIds = _purposeIds(requirements)
  const purposes = await _fetchPurposes(purposeIds)

  return ReturnRequirementsPresenter.go(requirements, purposes, points, journey)
}

async function _fetchPurposes (purposeIds) {
  return PurposeModel.query()
    .select([
      'purposes.id',
      'purposes.description'
    ])
    .findByIds(purposeIds)
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

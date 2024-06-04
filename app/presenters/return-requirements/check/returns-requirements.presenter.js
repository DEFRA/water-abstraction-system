'use strict'

const { formatAbstractionDate } = require('../../base.presenter.js')

/**
 * Formats return requirements data for the `/return-requirements/{sessionId}/check` page
 * @module ReturnRequirementsPresenter
 * @param {object} requirements - The requirements from the session
 * @param {module:PurposeModel} purposes - The purposes related to the ids of every requirement purpose
 * @param {string} journey - The journey from the session to determine if the journey is returns required
 *
 * @returns {Object} returns requirement data needed by the view template
 */

function go (requirements, purposes, journey) {
  return {
    returnsRequired: journey === 'returns-required',
    requirements: _requirements(requirements, purposes)
  }
}

function _abstractionPeriod (abstractionPeriod) {
  const { 'start-abstraction-period-day': startDay, 'start-abstraction-period-month': startMonth, 'end-abstraction-period-day': endDay, 'end-abstraction-period-month': endMonth } = abstractionPeriod
  const startDate = formatAbstractionDate(startDay, startMonth)
  const endDate = formatAbstractionDate(endDay, endMonth)

  return `From ${startDate} to ${endDate}`
}

function _requirements (requirements, purposes) {
  const completedRequirements = []

  for (const [index, requirement] of requirements.entries()) {
    const { agreementsExceptions } = requirement
    // NOTE: We determine a requirement is complete because agreement exceptions is populated and it is the last step in
    // the journey
    if (agreementsExceptions) {
      completedRequirements.push(_mapRequirement(requirement, index, purposes))
    }
  }

  return completedRequirements
}

function _mapPurposes (requirementPurposes, purposes) {
  return requirementPurposes.map((requirementPurpose) => {
    const matchedPurpose = purposes.find((purpose) => {
      return purpose.id === requirementPurpose
    })

    return matchedPurpose.description
  })
}

function _mapRequirement (requirement, index, purposes) {
  return {
    abstractionPeriod: _abstractionPeriod(requirement.abstractionPeriod),
    frequencyCollected: requirement.frequencyCollected,
    frequencyReported: requirement.frequencyReported,
    index,
    purposes: _mapPurposes(requirement.purposes, purposes),
    siteDescription: requirement.siteDescription
  }
}

module.exports = {
  go
}

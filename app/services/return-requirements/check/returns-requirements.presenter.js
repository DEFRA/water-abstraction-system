'use strict'

const { formatAbstractionDate } = require('../../../presenters/base.presenter.js')

/**
 * Formats data for the `/return-requirements/{sessionId}/check` page
 * @module ReturnRequirementsPresenter
 */

function go (requirements, purposeIds, journey) {
  //  Not clear of this can be an if else
  const returnsRequired = journey === 'returns-required'
  const noReturnsRequired = journey === 'no-returns-required'

  return {
    returnsRequired,
    noReturnsRequired,
    requirements: _requirements(requirements, purposeIds)
  }
}

function _abstractionPeriod (abstractionPeriod) {
  const { 'start-abstraction-period-day': startDay, 'start-abstraction-period-month': startMonth, 'end-abstraction-period-day': endDay, 'end-abstraction-period-month': endMonth } = abstractionPeriod
  const startDate = formatAbstractionDate(startDay, startMonth)
  const endDate = formatAbstractionDate(endDay, endMonth)

  return `From ${startDate} to ${endDate}`
}
function _requirements (requirements, purposeIds) {
  const completedRequirements = []

  for (const [index, requirement] of requirements.entries()) {
    const { agreementsExceptions } = requirement
    // NOTE: We determine a requirement is complete because agreement exceptions is populated and it is the last step in
    // the journey
    if (agreementsExceptions) {
      completedRequirements.push(_mapRequirement(requirement, index, purposeIds))
    }
  }

  return completedRequirements
}

function _mapRequirement (requirement, index, purposeIds) {
  return {
    abstractionPeriod: _abstractionPeriod(requirement.abstractionPeriod),
    frequencyCollected: requirement.frequencyCollected,
    frequencyReported: requirement.frequencyReported,
    index,
    purposes: _mapPurpoes(requirement.purposes, purposeIds),
    siteDescription: requirement.siteDescription
  }
}

function _mapPurpoes (purposes, purposeIds) {
  const uniquePurposes = [...new Set(purposes)]

  return uniquePurposes.map((purpose) => {
    return purposeIds.find((pid) => { return pid.id === purpose }).description
  })
}

module.exports = {
  go
}

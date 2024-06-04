'use strict'

const { formatAbstractionDate } = require('../../base.presenter.js')

/**
 * Formats return requirements data for the `/return-requirements/{sessionId}/check` page
 * @module ReturnRequirementsPresenter
 */

function go (requirements, purposeIds, journey) {
  return {
    returnsRequired: journey === 'returns-required',
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

function _mapPurposes (purposes, purposeIds) {
  return purposes.map((purpose) => {
    return purposeIds.find((pid) => { return pid.id === purpose }).description
  })
}

function _mapRequirement (requirement, index, purposeIds) {
  return {
    abstractionPeriod: _abstractionPeriod(requirement.abstractionPeriod),
    frequencyCollected: requirement.frequencyCollected,
    frequencyReported: requirement.frequencyReported,
    index,
    purposes: _mapPurposes(requirement.purposes, purposeIds),
    siteDescription: requirement.siteDescription
  }
}

module.exports = {
  go
}

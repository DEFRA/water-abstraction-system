'use strict'

const { formatAbstractionDate } = require('../../base.presenter.js')
const { generateAbstractionPointDetail } = require('../../../lib/general.lib.js')

const agreementsExceptionsText = {
  none: 'None',
  'gravity-fill': 'Gravity fill',
  'transfer-re-abstraction-scheme': 'Transfer re-abstraction scheme',
  'two-part-tariff': 'Two-part tariff',
  '56-returns-exception': '56 returns exception'
}

/**
 * Formats return requirements data for the `/return-requirements/{sessionId}/check` page
 * @module ReturnRequirementsPresenter
 */

/**
 * Formats return requirements data for the `/return-requirements/{sessionId}/check` page
 *
 * @param {Object[]} requirements - The existing return requirements in the current session
 * @param {module:PurposeModel[]} purposes - All purposes that match those selected across the return requirements
 * @param {Object[]} points - The points related to the licence
 * @param {string} journey - Whether the setup journey is 'no-returns-required' or 'returns-required'
 *
 * @returns {Object} returns requirement data needed by the view template
 */

function go (requirements, purposes, points, journey) {
  return {
    returnsRequired: journey === 'returns-required',
    requirements: _requirements(requirements, purposes, points)
  }
}

function _abstractionPeriod (abstractionPeriod) {
  const {
    'start-abstraction-period-day': startDay,
    'start-abstraction-period-month': startMonth,
    'end-abstraction-period-day': endDay,
    'end-abstraction-period-month': endMonth
  } = abstractionPeriod
  const startDate = formatAbstractionDate(startDay, startMonth)
  const endDate = formatAbstractionDate(endDay, endMonth)

  return `From ${startDate} to ${endDate}`
}

function _agreementsExceptions (agreementsExceptions) {
  if (agreementsExceptions[0] === agreementsExceptionsText.none) {
    return 'None'
  }

  const formattedExceptions = agreementsExceptions.map((exception) => {
    return agreementsExceptionsText[exception]
  })

  if (formattedExceptions.length === 1) {
    return formattedExceptions[0]
  }

  if (formattedExceptions.length === 2) {
    return formattedExceptions.join(' and ')
  }

  return formattedExceptions.slice(0, formattedExceptions.length - 1)
    .join(', ') + ', and ' + formattedExceptions[formattedExceptions.length - 1]
}

function _requirements (requirements, purposes, points) {
  const completedRequirements = []

  for (const [index, requirement] of requirements.entries()) {
    const { agreementsExceptions } = requirement
    // NOTE: We determine a requirement is complete because agreement exceptions is populated and it is the last step in
    // the journey
    if (agreementsExceptions) {
      completedRequirements.push(_mapRequirement(requirement, index, purposes, points))
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

function _mapRequirement (requirement, index, purposes, points) {
  return {
    abstractionPeriod: _abstractionPeriod(requirement.abstractionPeriod),
    agreementsExceptions: _agreementsExceptions(requirement.agreementsExceptions),
    frequencyCollected: requirement.frequencyCollected,
    frequencyReported: requirement.frequencyReported,
    index,
    points: _mapPoints(requirement.points, points),
    purposes: _mapPurposes(requirement.purposes, purposes),
    returnsCycle: requirement.returnsCycle === 'summer' ? 'Summer' : 'Winter and all year',
    siteDescription: requirement.siteDescription
  }
}

function _mapPoints (requirementPoints, points) {
  return requirementPoints.map((point) => {
    const matchedPoint = points.find((pid) => { return pid.ID === point })

    return generateAbstractionPointDetail(matchedPoint)
  })
}

module.exports = {
  go
}

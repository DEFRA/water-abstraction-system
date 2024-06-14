'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check` page
 * @module ViewService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')
const { formatAbstractionDate } = require('../../presenters/base.presenter')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/check` page
 *
 * @param {string} returnVersionId - The UUID for return requirement version
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (returnVersionId) {
  const returnVersion = await ReturnVersionModel.query()
    .select([
      'id',
      'licenceId',
      'startDate',
      'status'
    ])
    .findById(returnVersionId)
    .withGraphFetched('returnRequirements')

  const requirements = returnVersion.returnRequirements.map((requirement) => {
    return {
      abstractionPeriod: _abstractionPeriod(requirement),
      agreementsExceptions: _agreementsExceptions(requirement),
      frequencyCollected: requirement.frequencyCollected,
      frequencyReported: requirement.frequencyReported,
      // points: _mapPoints(requirement.points, points),
      // purposes: _mapPurposes(requirement.purposes, purposes),
      returnsCycle: requirement.returnsCycle === 'summer' ? 'Summer' : 'Winter and all year',
      siteDescription: requirement.siteDescription
    }
  })

  return {
    activeNavBar: 'search',
    data: returnVersion,
    requirements

  }
}

function _abstractionPeriod (requirement) {
  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  } = requirement

  const startDate = formatAbstractionDate(abstractionPeriodStartDay, abstractionPeriodStartMonth)
  const endDate = formatAbstractionDate(abstractionPeriodEndDay, abstractionPeriodEndMonth)

  return `From ${startDate} to ${endDate}`
}

function _agreementsExceptions (requirement) {
  const {
    gravityFill,
    reabstraction,
    twoPartTariff,
    fiftySixException
  } = requirement

  const agreementsExceptions = []

  if (gravityFill) {
    agreementsExceptions.push('Gravity fill')
  }

  if (reabstraction) {
    agreementsExceptions.push('Transfer re-abstraction scheme')
  }

  if (twoPartTariff) {
    agreementsExceptions.push('Two-part tariff')
  }

  if (fiftySixException) {
    agreementsExceptions.push('56 returns exception')
  }

  if (agreementsExceptions.length === 0) {
    return 'None'
  }

  if (agreementsExceptions.length === 1) {
    return agreementsExceptions[0]
  }

  if (agreementsExceptions.length === 2) {
    return agreementsExceptions.join(' and ')
  }

  return agreementsExceptions.slice(0, agreementsExceptions.length - 1)
    .join(', ') + ', and ' + agreementsExceptions[agreementsExceptions.length - 1]
}

module.exports = {
  go
}

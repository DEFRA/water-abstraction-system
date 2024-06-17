'use strict'

const { formatAbstractionDate } = require('../base.presenter.js')
const { formatLongDate } = require('../base.presenter.js')
const { generateAbstractionPointDetail } = require('../../lib/general.lib.js')
const { returnRequirementReasons } = require('../../lib/static-lookups.lib.js')

const agreementsExceptionsText = {
  none: 'None',
  'gravity-fill': 'Gravity fill',
  'transfer-re-abstraction-scheme': 'Transfer re-abstraction scheme',
  'two-part-tariff': 'Two-part tariff',
  '56-returns-exception': '56 returns exception'
}

/**
 * Formats return requirements data for the `/return-requirements/{sessionId}/view` page
 * @module ViewPresenter
 */

/**
 * Formats return requirements data for the `/return-requirements/{sessionId}/view` page
 *
 * @param {ReturnVersionModel[]} requirementsForReturns - The return version inc licence and requirements
 * @param {LicenceModel[]} points - The points related to the return version licence
 *
 * @returns {Object} returns requirement data needed by the view template
 */

function go (requirementsForReturns, points) {
  const { returnRequirements, licence, reason, startDate, status } = requirementsForReturns

  return {
    licenceRef: licence.licenceRef,
    pageTitle: `Check the requirements for returns for ${licence.$licenceHolder()}`,
    reason: returnRequirementReasons[reason] || '',
    startDate: formatLongDate(startDate),
    requirements: _requirements(returnRequirements, points),
    status,
    additionalSubmissionOptions: {
      multipleUpload: requirementsForReturns.multipleUpload === true ? 'Yes' : 'No'
    }
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

function _requirements (requirements, points) {
  return requirements.map((requirement) => {
    return _mapRequirement(requirement, points)
  })
}

function _mapRequirement (requirement, points) {
  return {
    abstractionPeriod: _abstractionPeriod(requirement.abstractionPeriod),
    agreementsExceptions: _agreementsExceptions(requirement.agreementsExceptions),
    frequencyCollected: requirement.frequencyCollected,
    frequencyReported: requirement.frequencyReported,
    points: _mapPoints(requirement.points, points),
    purposes: requirement.purposes,
    returnsCycle: requirement.returnsCycle === 'summer' ? 'Summer' : 'Winter and all year',
    siteDescription: requirement.siteDescription,
    returnReference: requirement.legacyId,
    title: [...requirement.purposes, requirement.siteDescription].join(', ')
  }
}

function _mapPoints (requirementPoints, points) {
  return requirementPoints.map((requirementPoint) => {
    const matchedPoint = points.find((pid) => { return pid.ID === requirementPoint })

    return generateAbstractionPointDetail(matchedPoint)
  })
}

module.exports = {
  go
}

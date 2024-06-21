'use strict'

/**
 * Formats requirements for returns data for the `/return-requirements/{sessionId}/view` page
 * @module ViewPresenter
 */

const { formatAbstractionDate } = require('../base.presenter.js')
const { formatLongDate } = require('../base.presenter.js')
const { generatePointDetail } = require('../../lib/general.lib.js')
const { returnRequirementReasons, returnRequirementFrequencies } = require('../../lib/static-lookups.lib.js')

/**
 * Formats requirements for returns data for the `/return-requirements/{sessionId}/view` page
 *
 * @param {ReturnVersionModel[]} requirementsForReturns
 * return version, licence, return requirements (requirement, points, purposes)
 *
 * @returns {Object} requirements for returns data needed by the view template
 */

function go (requirementsForReturns) {
  const { createdAt, createdBy, licence, reason, notes, multipleUpload, returnRequirements, startDate, status } =
    requirementsForReturns

  return {
    additionalSubmissionOptions: {
      multipleUpload: multipleUpload === true ? 'Yes' : 'No'
    },
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    notes,
    pageTitle: `Check the requirements for returns for ${licence.$licenceHolder()}`,
    reason: returnRequirementReasons[reason] || '',
    requirements: _requirements(returnRequirements),
    startDate: formatLongDate(startDate),
    status: _status(status),
    createdDate: formatLongDate(createdAt),
    createdBy: createdBy || ''
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

function _agreementsExceptions (returnRequirement) {
  const agreementsExceptions = _buildAgreementExceptions(returnRequirement)

  if (agreementsExceptions.length === 1) {
    return agreementsExceptions[0]
  }

  if (agreementsExceptions.length === 2) {
    return agreementsExceptions.join(' and ')
  }

  return agreementsExceptions.slice(0, agreementsExceptions.length - 1)
    .join(', ') + ', and ' + agreementsExceptions[agreementsExceptions.length - 1]
}

function _buildAgreementExceptions (returnRequirement) {
  const { fiftySixException, gravityFill, reabstraction, twoPartTariff } = returnRequirement
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
    agreementsExceptions.push('None')
  }

  return agreementsExceptions
}

function _mapRequirement (requirement) {
  return {
    abstractionPeriod: _abstractionPeriod(requirement),
    agreementsExceptions: _agreementsExceptions(requirement),
    frequencyCollected: returnRequirementFrequencies[requirement.collectionFrequency],
    frequencyReported: returnRequirementFrequencies[requirement.reportingFrequency],
    points: _points(requirement.points),
    purposes: _purposes(requirement.purposes),
    returnReference: requirement.legacyId,
    returnsCycle: requirement.summer === true ? 'Summer' : 'Winter and all year',
    siteDescription: requirement.siteDescription,
    title: requirement.siteDescription
  }
}

function _purposes (returnRequirementPurposes) {
  return returnRequirementPurposes.map((returnRequirementPurpose) => {
    return returnRequirementPurpose.purposeDetails.description
  })
}

function _points (returnRequirementPoints) {
  return returnRequirementPoints.map((returnRequirementPoint) => {
    return generatePointDetail(returnRequirementPoint)
  })
}

function _requirements (requirements) {
  return requirements.map((requirement) => {
    return _mapRequirement(requirement)
  })
}

function _status (status) {
  const statuses = {
    current: 'approved',
    superseded: 'replaced'
  }

  return statuses[status]
}

module.exports = {
  go
}

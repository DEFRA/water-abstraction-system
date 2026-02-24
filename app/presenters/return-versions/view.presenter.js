'use strict'

/**
 * Formats return version data ready for presenting in the view return version page
 * @module ViewPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../base.presenter.js')
const { isQuarterlyReturnSubmissions } = require('../../lib/dates.lib.js')
const PreviousAndNextPresenter = require('../previous-and-next.presenter.js')
const { returnRequirementReasons, returnRequirementFrequencies } = require('../../lib/static-lookups.lib.js')

/**
 * Formats return version data ready for presenting in the view return version page
 *
 * @param {object} returnVersionData - The selected return version, and the return versions for pagination
 *
 * @returns {object} page data formatted for the view template
 */
function go(returnVersionData) {
  const { returnVersion, returnVersionsForPagination } = returnVersionData

  const { licence, multipleUpload, quarterlyReturns, returnRequirements, startDate, status } = returnVersion

  return {
    backLink: {
      href: `/system/licences/${licence.id}/set-up`,
      text: 'Go back to summary'
    },
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    multipleUpload: multipleUpload === true ? 'Yes' : 'No',
    notes: returnVersion.$notes(),
    pageTitle: `Requirements for returns starting ${formatLongDate(startDate)}`,
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    pagination: _pagination(returnVersionsForPagination, returnVersion),
    quarterlyReturnSubmissions: isQuarterlyReturnSubmissions(startDate),
    quarterlyReturns: quarterlyReturns === true ? 'Yes' : 'No',
    reason: _reason(returnVersion),
    requirements: _requirements(returnRequirements),
    status
  }
}

function _abstractionPeriod(requirement) {
  const abstractionPeriod = formatAbstractionPeriod(
    requirement.abstractionPeriodStartDay,
    requirement.abstractionPeriodStartMonth,
    requirement.abstractionPeriodEndDay,
    requirement.abstractionPeriodEndMonth
  )

  return abstractionPeriod ?? ''
}

function _agreementsExceptions(returnRequirement) {
  const agreementsExceptions = _buildAgreementExceptions(returnRequirement)

  if (agreementsExceptions.length === 1) {
    return agreementsExceptions[0]
  }

  if (agreementsExceptions.length === 2) {
    return agreementsExceptions.join(' and ')
  }

  return (
    agreementsExceptions.slice(0, agreementsExceptions.length - 1).join(', ') +
    ', and ' +
    agreementsExceptions[agreementsExceptions.length - 1]
  )
}

function _buildAgreementExceptions(returnRequirement) {
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

function _mapRequirement(requirement) {
  return {
    abstractionPeriod: _abstractionPeriod(requirement),
    agreementsExceptions: _agreementsExceptions(requirement),
    frequencyCollected: returnRequirementFrequencies[requirement.collectionFrequency],
    frequencyReported: returnRequirementFrequencies[requirement.reportingFrequency],
    points: _points(requirement.points),
    purposes: _purposes(requirement.returnRequirementPurposes),
    returnReference: requirement.legacyId,
    returnsCycle: requirement.summer === true ? 'Summer' : 'Winter and all year',
    siteDescription: requirement.siteDescription ?? '',
    title: requirement.siteDescription ?? ''
  }
}

/**
 * Calculate the previous and next licence versions to create the pagination object. This feeds directly into the GDS
 * component.
 *
 * @private
 */
function _pagination(returnVersionsForPagination, returnVersion) {
  const { previous, next } = PreviousAndNextPresenter.go(returnVersionsForPagination, returnVersion)

  if (!next && !previous) {
    return null
  }

  const pagination = {}

  if (previous) {
    pagination.previous = {
      text: 'Previous version',
      labelText: `Starting ${formatLongDate(previous.startDate)}`,
      href: `/system/return-versions/${previous.id}`
    }
  }

  if (next) {
    pagination.next = {
      text: 'Next version',
      labelText: `Starting ${formatLongDate(next.startDate)}`,
      href: `/system/return-versions/${next.id}`
    }
  }

  return pagination
}

function _purposes(returnRequirementPurposes) {
  return returnRequirementPurposes.map((returnRequirementPurpose) => {
    if (returnRequirementPurpose.alias) {
      return `${returnRequirementPurpose.purpose.description} (${returnRequirementPurpose.alias})`
    }

    return returnRequirementPurpose.purpose.description
  })
}

function _points(points) {
  return points.map((point) => {
    return point.$describe()
  })
}

/**
 * The history helper $reason() will return either the reason saved against the return version record, the reason
 * captured in the first mod log entry, or null.
 *
 * If its the reason saved against the return version we have to map it to its display version first.
 *
 * @private
 */
function _reason(returnVersion) {
  const createdAt = formatLongDate(returnVersion.$createdAt())
  const createdBy = returnVersion.$createdBy()
  const reason = returnVersion.$reason()

  const mappedReason = returnRequirementReasons[reason] ?? reason

  if (!mappedReason) {
    return `Created on ${createdAt}`
  }

  if (!createdBy) {
    return `${mappedReason} migrated from NALD on ${createdAt}`
  }

  return `${mappedReason} created on ${createdAt} by ${createdBy}`
}

function _requirements(requirements) {
  return requirements.map((requirement) => {
    return _mapRequirement(requirement)
  })
}

module.exports = {
  go
}

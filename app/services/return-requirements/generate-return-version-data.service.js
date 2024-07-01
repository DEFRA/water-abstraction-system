'use strict'

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 * @module GenerateReturnVersionDataService
 */

const FetchPointsService = require('./fetch-points.service.js')
const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Uses the session data to generate the data sets required to create a new return version for a licence
 *
 * Creates the data needed to populate the `return_versions`, `return_requirements`, `return_requirement_points` and
 * `return_requirement_purposes` tables.
 *
 * @param {string} session - The session data required to set up a new return version for a licence
 * @param {number} userId - The id of the logged in user
 *
 * @returns {string} The licence ID
 */
async function go (session, userId) {
  const returnVersion = await _generateReturnVersionData(session, userId)
  const returnRequirementsData = await _generateReturnRequirementsData(session.licence.id, session.requirements)

  return {
    returnVersion,
    returnRequirementsData
  }
}

function _calculateStartDate (session) {
  if (session.startDateOptions === 'anotherStartDate') {
    // Reminder! Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
    // January is actually 0, February is 1 etc. This is why we deduct 1 from the month.
    return new Date(session.startDateYear, session.startDateMonth - 1, session.startDateDay)
  }

  return session.licence.currentVersionStartDate
}

async function _generateReturnRequirementsData (licenceId, requirements) {
  const points = await FetchPointsService.go(licenceId)
  const returnRequirements = []

  for (const requirement of requirements) {
    const legacyId = await _getNextLegacyId(licenceId)
    const requirementExternalId = await _generateRequirementExternalId(legacyId, licenceId)

    const returnRequirement = {
      returns_frequency: 'year',
      summer: requirement.returnsCycle === 'summer',
      abstractionPeriodStartDay: requirement.abstractionPeriod['start-abstraction-period-day'],
      abstractionPeriodStartMonth: requirement.abstractionPeriod['start-abstraction-period-month'],
      abstractionPeriodEndDay: requirement.abstractionPeriod['end-abstraction-period-day'],
      abstractionPeriodEndMonth: requirement.abstractionPeriod['end-abstraction-period-month'],
      siteDescription: requirement.siteDescription,
      legacyId,
      externalId: requirementExternalId,
      reportingFrequency: requirement.frequencyReported,
      collectionFrequency: requirement.frequencyCollected,
      gravityFill: requirement.agreementsExceptions.includes('gravity-fill'),
      reabstraction: requirement.agreementsExceptions.includes('transfer-re-abstraction-scheme'),
      twoPartTariff: requirement.agreementsExceptions.includes('two-part-tariff'),
      fiftySixException: requirement.agreementsExceptions.includes('56-returns-exception'),
      returnRequirementPoints: _generateReturnRequirementPointsData(points, requirementExternalId, requirement.points),
      returnRequirementPurposes: await _generateReturnRequirementPurposesData(licenceId, requirement.purposes)
    }

    returnRequirements.push(returnRequirement)
  }

  return returnRequirements
}

function _generateReturnRequirementPointsData (points, requirementExternalId, requirementPoints) {
  const returnRequirementPoints = []

  requirementPoints.forEach((requirementPoint) => {
    const point = points.find((point) => {
      return point.ID === requirementPoint
    })

    const returnRequirementPoint = {
      description: point.LOCAL_NAME,
      ngr1: point.NGR1_SHEET !== 'null' ? `${point.NGR1_SHEET} ${point.NGR1_EAST} ${point.NGR1_NORTH}` : null,
      ngr2: point.NGR2_SHEET !== 'null' ? `${point.NGR2_SHEET} ${point.NGR2_EAST} ${point.NGR2_NORTH}` : null,
      ngr3: point.NGR3_SHEET !== 'null' ? `${point.NGR3_SHEET} ${point.NGR3_EAST} ${point.NGR3_NORTH}` : null,
      ngr4: point.NGR4_SHEET !== 'null' ? `${point.NGR4_SHEET} ${point.NGR4_EAST} ${point.NGR4_NORTH}` : null,
      externalId: `${requirementExternalId}:${point.ID}`,
      naldPointId: point.ID
    }

    returnRequirementPoints.push(returnRequirementPoint)
  })

  return returnRequirementPoints
}

async function _generateReturnRequirementPurposesData (licenceId, purposeIds) {
  const returnRequirementPurposes = []

  for (const purposeId of purposeIds) {
    const { primaryPurposeId, secondaryPurposeId } = await LicenceVersionModel.query()
      .select('primaryPurposeId', 'secondaryPurposeId')
      .innerJoinRelated('licenceVersionPurposes')
      .where('licenceId', licenceId)
      .andWhere('status', 'current')
      .andWhere('purposeId', purposeId)
      .first()

    const returnRequirementPurpose = {
      purposeId,
      primaryPurposeId,
      secondaryPurposeId
    }

    returnRequirementPurposes.push(returnRequirementPurpose)
  }

  return returnRequirementPurposes
}

async function _generateReturnVersionData (session, userId) {
  const multipleUpload = _multipleUpload(session?.additionalSubmissionOptions)

  return {
    licenceId: session.licence.id,
    version: await _getNextVersionNumber(session.licence.id),
    startDate: _calculateStartDate(session),
    endDate: null,
    status: 'current',
    reason: session.reason,
    multipleUpload,
    notes: session?.note?.content,
    createdBy: userId
  }
}

async function _generateRequirementExternalId (legacyId, licenceId) {
  const { naldRegionId } = await LicenceModel.query()
    .findById(licenceId)
    .select('region.naldRegionId')
    .innerJoinRelated('region')

  return `${naldRegionId}:${legacyId}`
}

async function _getNextLegacyId (licenceId) {
  const { lastLegacyId } = await ReturnVersionModel.query()
    .max('returnRequirements.legacyId as lastLegacyId')
    .innerJoinRelated('returnRequirements')
    .where({ licenceId })
    .first()

  if (lastLegacyId) {
    return lastLegacyId + 1
  }

  return 1
}

async function _getNextVersionNumber (licenceId) {
  const { lastVersionNumber } = await ReturnVersionModel.query()
    .max('version as lastVersionNumber')
    .where({ licenceId })
    .first()

  if (lastVersionNumber) {
    return lastVersionNumber + 1
  }

  return 1
}

function _multipleUpload (additionalSubmissionOptions) {
  return additionalSubmissionOptions ? additionalSubmissionOptions.includes('multiple-upload') : false
}

module.exports = {
  go
}

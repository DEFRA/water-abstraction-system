'use strict'

/**
 * Uses the session data to generate the data sets required to create the return version requirements for a licence
 * @module GenerateReturnVersionRequirementsService
 */

const FetchPointsService = require('./fetch-points.service.js')
const LicenceModel = require('../../models/licence.model.js')
const LicenceVersionModel = require('../../models/licence-version.model.js')
const ReturnRequirementModel = require('../../models/return-requirement.model.js')

/**
 * Uses the session data to generate the data sets required to create the return version requirements for a licence
 *
 * Creates the data needed to populate the `return_requirements`, `return_requirement_points` and
 * `return_requirement_purposes` tables.
 *
 * @param {String} licenceId - The UUID of the licence the requirements are for
 * @param {Object[]} requirements - The return requirements data from the session
 *
 * @returns {Promise<Object>} The new return version requirements data for a licence
 */
async function go (licenceId, requirements) {
  const points = await FetchPointsService.go(licenceId)
  const returnRequirements = []

  for (const requirement of requirements) {
    const legacyId = await _getNextLegacyId()
    const requirementExternalId = await _generateRequirementExternalId(legacyId, licenceId)

    const returnRequirement = {
      returnsFrequency: 'year',
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
      returnRequirementPoints: _generateReturnRequirementPoints(points, requirementExternalId, requirement.points),
      returnRequirementPurposes: await _generateReturnRequirementPurposes(licenceId, requirement.purposes)
    }

    returnRequirements.push(returnRequirement)
  }

  return returnRequirements
}

function _generateReturnRequirementPoints (points, requirementExternalId, requirementPoints) {
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

async function _generateReturnRequirementPurposes (licenceId, purposeIds) {
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

async function _generateRequirementExternalId (legacyId, licenceId) {
  const { naldRegionId } = await LicenceModel.query()
    .findById(licenceId)
    .select('region.naldRegionId')
    .innerJoinRelated('region')

  return `${naldRegionId}:${legacyId}`
}

async function _getNextLegacyId () {
  const { lastLegacyId } = await ReturnRequirementModel.query()
    .max('legacyId as lastLegacyId')
    .first()

  if (lastLegacyId) {
    return lastLegacyId + 1
  }

  return 1
}

module.exports = {
  go
}

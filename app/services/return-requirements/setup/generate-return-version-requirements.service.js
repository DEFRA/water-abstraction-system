'use strict'

/**
 * Uses the session data to generate the data sets required to create the return version requirements for a licence
 * @module GenerateReturnVersionRequirementsService
 */

const LicenceModel = require('../../../models/licence.model.js')
const LicenceVersionModel = require('../../../models/licence-version.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')

/**
 * Uses the session data to generate the data sets required to create the return version requirements for a licence
 *
 * Creates the data needed to populate the `return_requirements`, `return_requirement_points` and
 * `return_requirement_purposes` tables.
 *
 * @param {string} licenceId - The UUID of the licence the requirements are for
 * @param {object[]} requirements - The return requirements data from the session
 *
 * @returns {Promise<object>} The new return version requirements data for a licence
 */
async function go (licenceId, requirements) {
  const naldRegionId = await _fetchNaldRegionId(licenceId)
  const returnRequirements = []

  let legacyId = await _nextLegacyId(naldRegionId)

  for (const requirement of requirements) {
    const externalId = `${naldRegionId}:${legacyId}`

    const returnRequirementPurposes = await _generateReturnRequirementPurposes(licenceId, requirement.purposes)

    const returnRequirement = {
      abstractionPeriodStartDay: requirement.abstractionPeriod['start-abstraction-period-day'],
      abstractionPeriodStartMonth: requirement.abstractionPeriod['start-abstraction-period-month'],
      abstractionPeriodEndDay: requirement.abstractionPeriod['end-abstraction-period-day'],
      abstractionPeriodEndMonth: requirement.abstractionPeriod['end-abstraction-period-month'],
      collectionFrequency: requirement.frequencyCollected,
      externalId,
      fiftySixException: requirement.agreementsExceptions.includes('56-returns-exception'),
      gravityFill: requirement.agreementsExceptions.includes('gravity-fill'),
      legacyId,
      points: requirement.points,
      reabstraction: requirement.agreementsExceptions.includes('transfer-re-abstraction-scheme'),
      reportingFrequency: requirement.frequencyReported,
      returnsFrequency: 'year',
      returnRequirementPurposes,
      siteDescription: requirement.siteDescription,
      summer: requirement.returnsCycle === 'summer',
      twoPartTariff: requirement.agreementsExceptions.includes('two-part-tariff')
    }

    legacyId++

    returnRequirements.push(returnRequirement)
  }

  return returnRequirements
}

async function _fetchNaldRegionId (licenceId) {
  const { naldRegionId } = await LicenceModel.query()
    .findById(licenceId)
    .select('region.naldRegionId')
    .innerJoinRelated('region')

  return naldRegionId
}

async function _generateReturnRequirementPurposes (licenceId, purposes) {
  const returnRequirementPurposes = []

  for (const purpose of purposes) {
    const { primaryPurposeId, secondaryPurposeId } = await LicenceVersionModel.query()
      .select('primaryPurposeId', 'secondaryPurposeId')
      .innerJoinRelated('licenceVersionPurposes')
      .where('licenceId', licenceId)
      .andWhere('status', 'current')
      .andWhere('purposeId', purpose.id)
      .first()

    const returnRequirementPurpose = {
      alias: purpose.alias !== '' ? purpose.alias : null,
      primaryPurposeId,
      purposeId: purpose.id,
      secondaryPurposeId
    }

    returnRequirementPurposes.push(returnRequirementPurpose)
  }

  return returnRequirementPurposes
}

async function _nextLegacyId (naldRegionId) {
  const { lastLegacyId } = await ReturnRequirementModel.query()
    .max('legacyId as lastLegacyId')
    .whereLike('externalId', `${naldRegionId}%`)
    .first()

  if (lastLegacyId) {
    return lastLegacyId + 1
  }

  return 1
}

module.exports = {
  go
}

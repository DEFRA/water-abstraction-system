'use strict'

/**
 * Uses the session data to generate the data sets required to create the return version requirements for a licence
 * @module GenerateReturnVersionRequirementsService
 */

const LicenceVersionModel = require('../../../../models/licence-version.model.js')

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
async function go(licenceId, requirements) {
  const returnRequirements = []

  for (const requirement of requirements) {
    const returnRequirementPurposes = await _generateReturnRequirementPurposes(licenceId, requirement.purposes)

    const returnRequirement = {
      abstractionPeriodStartDay: requirement.abstractionPeriod.abstractionPeriodStartDay,
      abstractionPeriodStartMonth: requirement.abstractionPeriod.abstractionPeriodStartMonth,
      abstractionPeriodEndDay: requirement.abstractionPeriod.abstractionPeriodEndDay,
      abstractionPeriodEndMonth: requirement.abstractionPeriod.abstractionPeriodEndMonth,
      collectionFrequency: requirement.frequencyCollected,
      fiftySixException: requirement.agreementsExceptions.includes('56-returns-exception'),
      gravityFill: requirement.agreementsExceptions.includes('gravity-fill'),
      points: requirement.points,
      reabstraction: requirement.agreementsExceptions.includes('transfer-re-abstraction-scheme'),
      reportingFrequency: requirement.frequencyReported,
      returnsFrequency: 'year',
      returnRequirementPurposes,
      siteDescription: requirement.siteDescription,
      summer: requirement.returnsCycle === 'summer',
      twoPartTariff: requirement.agreementsExceptions.includes('two-part-tariff')
    }

    returnRequirements.push(returnRequirement)
  }

  return returnRequirements
}

async function _generateReturnRequirementPurposes(licenceId, purposes) {
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

module.exports = {
  go
}

'use strict'

/**
 * @module RequirementsForReturnsSeeder
 */

const PurposeHelper = require('../helpers/purpose.helper.js')
const ReturnRequirementPointHelper = require('../helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../helpers/return-requirement-purpose.helper.js')
const ReturnRequirementHelper = require('../helpers/return-requirement.helper.js')
const ReturnVersionHelper = require('../helpers/return-version.helper.js')

/**
 * Add a complete 'requirements for returns' record, including return version, requirements, points and purposes
 *
 * Was built to support the testing of `GenerateFromExistingRequirementsService` but can be used in any scenario where a
 * complete 'requirements for returns' record is needed.
 *
 * It creates the parent return version then two return requirement records. To each it adds a return requirement point
 * and purpose record.
 *
 * The first requirement has a winter returns cycle. reports weekly, and has no agreements. The second has a summer
 * returns cycle, reports monthly, and has _all_ the agreements!
 *
 * Because of this it can be useful to test presenters and services that need to transform the data.
 *
 * @param {String} [licenceId] - The UUID of the licence to link the return version to
 *
 * @returns a 'complete' `ReturnVersionModel` instance with two return requirements, each containing a point and a
 * purpose
 */
async function seed (licenceId) {
  // Create a return version to which we'll link multiple return requirements
  const returnVersion = await ReturnVersionHelper.add({ licenceId })

  // Create the first requirement record
  let returnRequirement = await _returnRequirement(
    returnVersion.id,
    'week',
    false,
    1234,
    false,
    'I have an alias'
  )

  returnVersion.returnRequirements = [returnRequirement]

  // Create the second requirement record
  returnRequirement = await _returnRequirement(
    returnVersion.id,
    'month',
    true,
    4321,
    true,
    null
  )
  returnVersion.returnRequirements.push(returnRequirement)

  return returnVersion
}

async function _returnRequirement (
  returnVersionId,
  reportingFrequency,
  summer,
  naldPointId,
  agreements,
  alias
) {
  const returnRequirement = await ReturnRequirementHelper.add({
    collectionFrequency: 'week',
    fiftySixException: agreements,
    gravityFill: agreements,
    reabstraction: agreements,
    reportingFrequency,
    returnVersionId,
    siteDescription: summer ? 'SECOND BOREHOLE AT AVALON' : 'FIRST BOREHOLE AT AVALON',
    summer,
    twoPartTariff: agreements
  })

  const { id: returnRequirementId } = returnRequirement

  const point = await ReturnRequirementPointHelper.add({ naldPointId, returnRequirementId })

  returnRequirement.returnRequirementPoints = [point]

  const purpose = await PurposeHelper.add()

  const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
    purposeId: purpose.id, returnRequirementId, alias
  })

  returnRequirement.returnRequirementPurposes = [returnRequirementPurpose]

  return returnRequirement
}

module.exports = {
  seed
}

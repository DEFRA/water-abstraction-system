'use strict'

/**
 * @module RequirementsForReturnsSeeder
 */

const LicenceHelper = require('../helpers/licence.helper.js')
const PointHelper = require('../helpers/point.helper.js')
const PurposeHelper = require('../helpers/purpose.helper.js')
const ReturnRequirementHelper = require('../helpers/return-requirement.helper.js')
const ReturnRequirementPointHelper = require('../helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../helpers/return-requirement-purpose.helper.js')
const ReturnVersionHelper = require('../helpers/return-version.helper.js')
const UserHelper = require('../helpers/user.helper.js')

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
 * @returns {Promise<object>} a 'complete' `ReturnVersionModel` instance with two return requirements, each containing a
 * point and a purpose plus an instance of `UserModel` for the user that created it and `LicenceModel` for the licence
 * it is linked to
 */
async function seed() {
  // Select a user
  const user = UserHelper.select()

  // Create a licence
  const licence = await LicenceHelper.add()

  // Create a return version to which we'll link multiple return requirements
  const returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id, createdBy: user.id })

  // Create the first requirement record
  let returnRequirement = await _returnRequirement(returnVersion.id, 'week', false, false, 'I have an alias')

  returnVersion.returnRequirements = [returnRequirement]

  // Create the second requirement record
  returnRequirement = await _returnRequirement(returnVersion.id, 'month', true, true, null)
  returnVersion.returnRequirements.push(returnRequirement)

  return { licence, returnVersion, user }
}

async function _returnRequirement(returnVersionId, reportingFrequency, summer, agreements, alias) {
  const returnRequirement = await ReturnRequirementHelper.add({
    collectionFrequency: 'week',
    fiftySixException: agreements,
    gravityFill: agreements,
    reabstraction: agreements,
    reportingFrequency,
    returnVersionId,
    siteDescription: summer ? 'SUMMER BOREHOLE AT AVALON' : 'WINTER BOREHOLE AT AVALON',
    summer,
    twoPartTariff: agreements
  })

  const { id: returnRequirementId } = returnRequirement

  const point = await PointHelper.add()

  await ReturnRequirementPointHelper.add({ pointId: point.id, returnRequirementId })

  returnRequirement.points = [point]

  const purpose = PurposeHelper.data.find((purpose) => {
    return purpose.legacyId === '420'
  })

  const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
    purposeId: purpose.id,
    returnRequirementId,
    alias
  })

  returnRequirementPurpose.purpose = purpose

  returnRequirement.returnRequirementPurposes = [returnRequirementPurpose]

  return returnRequirement
}

module.exports = {
  seed
}

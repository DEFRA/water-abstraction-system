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
async function seed () {
  // Select a user
  const user = UserHelper.select()

  // Create a licence
  const licence = await LicenceHelper.add()

  // Create a return version to which we'll link multiple return requirements
  const returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id, createdBy: user.id })

  const legacyIds = _legacyIds()

  // Create the first requirement record
  let returnRequirement = await _returnRequirement(
    returnVersion.id,
    legacyIds[0],
    'week',
    false,
    false,
    'I have an alias'
  )

  returnVersion.returnRequirements = [returnRequirement]

  // Create the second requirement record
  returnRequirement = await _returnRequirement(
    returnVersion.id,
    legacyIds[1],
    'month',
    true,
    true,
    null
  )
  returnVersion.returnRequirements.push(returnRequirement)

  return { licence, returnVersion, user }
}

/**
 * Our tests for FetchReturnVersionsService include checks that the order of the return requirements is as expected. The
 * order is based on legacy ID (return reference), so we need to control what values we use for the tests to work. But
 * legacy ID is also a constrained value in the table: it has to be unique.
 *
 * So, rather than fixing the values, we still randomly generate them to avoid errors because of duplicated values. We
 * then use the higher ID for the first seeded return requirement (lower for the second).
 *
 * In the test, we can then confirm the return requirement with the lower legacy ID comes first (we expect them ordered
 * in ascending order on the page).
 *
 * @private
 */
function _legacyIds () {
  const legacyId1 = ReturnRequirementHelper.generateLegacyId()
  const legacyId2 = ReturnRequirementHelper.generateLegacyId()

  return legacyId1 > legacyId2 ? [legacyId1, legacyId2] : [legacyId2, legacyId1]
}

async function _returnRequirement (
  returnVersionId,
  legacyId,
  reportingFrequency,
  summer,
  agreements,
  alias
) {
  const returnRequirement = await ReturnRequirementHelper.add({
    collectionFrequency: 'week',
    fiftySixException: agreements,
    gravityFill: agreements,
    legacyId,
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
    purposeId: purpose.id, returnRequirementId, alias
  })

  returnRequirementPurpose.purpose = purpose

  returnRequirement.returnRequirementPurposes = [returnRequirementPurpose]

  return returnRequirement
}

module.exports = {
  seed
}

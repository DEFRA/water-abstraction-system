'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypesHelper = require('../../support/helpers/licence-version-purpose-condition-type.helper.js')

// Thing under test
const FetchLicenceAbstractionConditionsService = require('../../../app/services/licences/fetch-licence-abstraction-conditions.service.js')

describe.only('Fetch Licence Abstraction Conditions service', () => {
  let currentLicenceVersionId
  let purposeIds

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there are abstraction conditions for the licence version', () => {
    beforeEach(async () => {
      const { id: licenceVersionId } = await LicenceVersionHelper.add({ status: 'current' })
      currentLicenceVersionId = licenceVersionId

      const purpose1 = await PurposeHelper.add({ description: 'Mineral Washing' })
      const purpose2 = await PurposeHelper.add({ description: 'Spray Irrigation - Storage' })
      purposeIds = [purpose1.id, purpose2.id]

      const condition1 = await LicenceVersionPurposeConditionTypesHelper.add({
        displayTitle: 'Derogation clause'
      })
      const condition2 = await LicenceVersionPurposeConditionTypesHelper.add({
        displayTitle: 'Non standard quantities'
      })
      const condition3 = await LicenceVersionPurposeConditionTypesHelper.add({
        displayTitle: 'General conditions'
      })

      // Create multiple purposes for the licence version then assign multiple conditions to them!
      // First purpose conditions
      let licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId: purpose1.id })
      await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        licenceVersionPurposeConditionTypeId: condition1.id
      })
      await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        licenceVersionPurposeConditionTypeId: condition2.id
      })

      // Second purpose conditions
      licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId: purpose2.id })
      // NOTE: we apply the same condition as used in the first purpose to reflect that what can happen in the data;
      // 2 different purposes can be assigned the same condition
      await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        licenceVersionPurposeConditionTypeId: condition1.id
      })
      await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        licenceVersionPurposeConditionTypeId: condition3.id
      })
    })

    it('returns a distinct list of the conditions, the purpose IDs plus the total number of conditions', async () => {
      const result = await FetchLicenceAbstractionConditionsService.go(currentLicenceVersionId)

      expect(result.conditions).to.equal(['Derogation clause', 'General conditions', 'Non standard quantities'])
      expect(result.purposeIds).to.includes(purposeIds)
      expect(result.numberOfConditions).to.equal(4)
    })
  })

  describe('when there are no abstraction conditions for the licence version', () => {
    it('returns an empty array of conditions, purpose IDs and 0 for the number of conditions', async () => {
      const result = await FetchLicenceAbstractionConditionsService.go(currentLicenceVersionId)

      expect(result.conditions).to.be.empty()
      expect(result.purposeIds).to.be.empty()
      expect(result.numberOfConditions).to.equal(0)
    })
  })
})

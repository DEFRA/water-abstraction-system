'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypesHelper = require('../../support/helpers/licence-version-purpose-condition-type.helper.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const FetchLicenceVersionPurposeConstionService = require('../../../app/services/licences/fetch-licence-version-purpose-condition.service.js')

describe('Fetch licence version purpose condition service', () => {
  let abstractConditionsTypes
  let licence
  let licenceData

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there is no linked purpose data in the model', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      abstractConditionsTypes = await LicenceVersionPurposeConditionTypesHelper.add()
      await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeConditionTypeId: abstractConditionsTypes.id
      })

      licenceData = await FetchLicenceService.go(licence.id)
    })

    it('returns results', async () => {
      const result = await FetchLicenceVersionPurposeConstionService.go(licenceData)

      expect(result.numberOfAbstractionConditions).to.equal(0)
      expect(result.uniqueAbstractionConditionTitles).to.equal([])
    })
  })

  describe('when there is no optional data in the model', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      abstractConditionsTypes = await LicenceVersionPurposeConditionTypesHelper.add()
      await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeConditionTypeId: abstractConditionsTypes.id,
        licenceVersionPurposeId: licenceVersionPurpose.id
      })

      licenceData = await FetchLicenceService.go(licence.id)
    })

    it('returns results', async () => {
      const result = await FetchLicenceVersionPurposeConstionService.go(licenceData)

      expect(result.numberOfAbstractionConditions).to.equal(1)
      expect(result.uniqueAbstractionConditionTitles).to.equal(['Link between split licences'])
    })
  })

  describe('when there is ids passed to the function', () => {
    it('returns an empty array', async () => {
      const result = await FetchLicenceVersionPurposeConstionService.go(undefined)

      expect(result).to.equal({
        numberOfAbstractionConditions: 0,
        uniqueAbstractionConditionTitles: []
      })
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const FinancialAgreementHelper = require('../../support/helpers/financial-agreement.helper.js')
const LicenceAgreementHelper = require('../../support/helpers/licence-agreement.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const PermitLicenceHelper = require('../../support/helpers/permit-licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchAbstractionDataReturnRequirementsService =
  require('../../../app/services/return-requirements/fetch-requirements-from-abstraction-data.service.js')

describe.only('Fetch return requirements base on abstraction data service', () => {
  describe('when called with a valid licenceId of a water undertaker with just one purpose', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id,
        waterUndertaker: true
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      const testFinancialAgreements = await FinancialAgreementHelper.add()

      const { id: financialAgreementId } = testFinancialAgreements

      await LicenceAgreementHelper.add({
        licenceRef: licence.licenceRef,
        financialAgreementId
      })

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'daily',
        reportingFrequency: 'daily',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })

  describe('when called with a valid licenceId of a water undertaker with just one purpose and summer abstraction', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id,
        waterUndertaker: true
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        abstractionPeriodStartMonth: 6,
        abstractionPeriodEndMonth: 6,
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      const testFinancialAgreements = await FinancialAgreementHelper.add()

      const { id: financialAgreementId } = testFinancialAgreements

      await LicenceAgreementHelper.add({
        licenceRef: licence.licenceRef,
        financialAgreementId
      })

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 6,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 6,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: true,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'daily',
        reportingFrequency: 'daily',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })

  describe('when called with a valid licenceId of a water undertaker with just one purpose and winter abstraction', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id,
        waterUndertaker: true
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        abstractionPeriodStartMonth: 6,
        abstractionPeriodEndMonth: 12,
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      const testFinancialAgreements = await FinancialAgreementHelper.add()

      const { id: financialAgreementId } = testFinancialAgreements

      await LicenceAgreementHelper.add({
        licenceRef: licence.licenceRef,
        financialAgreementId
      })

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 6,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 12,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'daily',
        reportingFrequency: 'daily',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })

  describe('when called with a valid licenceId of a water undertaker with just one purpose and no agreements', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id,
        waterUndertaker: true
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'daily',
        reportingFrequency: 'daily',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })

  describe('when called with a valid licenceId with just one purpose which is a water generator', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add({
        legacyId: '200'
      })
      await LicenceVersionPurposeHelper.add({
        dailyQuantity: 30,
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'daily',
        reportingFrequency: 'daily',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })


  describe('when called with a valid licenceId with just one purpose with a very small daily amount and no agreements', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        dailyQuantity: 30,
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'none',
        reportingFrequency: 'monthly',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })

  describe('when called with a valid licenceId with just one purpose with a medium daily amount and no agreements', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        dailyQuantity: 1000,
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'monthly',
        reportingFrequency: 'monthly',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })

  describe('when called with a valid licenceId with just one purpose with a high daily amount and no agreements', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        dailyQuantity: 3000,
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'weekly',
        reportingFrequency: 'weekly',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })

  describe('when called with a valid licenceId with just one purpose that has no licence agreements', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with one entry', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'none',
        reportingFrequency: 'monthly',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })

  describe('when called with a valid licenceId with two purposes', () => {
    let licence

    beforeEach(async () => {
      await DatabaseSupport.clean()

      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        externalId: '6:10064842',
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      const secondPurpose = await PurposeHelper.add({
        description: 'Mineral Washing'
      })
      await LicenceVersionPurposeHelper.add({
        dailyQuantity: 3000,
        externalId: '6:10064843',
        licenceVersionId: licenceVersion.id,
        purposeId: secondPurpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)

      const testFinancialAgreements = await FinancialAgreementHelper.add()

      const { id: financialAgreementId } = testFinancialAgreements

      await LicenceAgreementHelper.add({
        licenceRef: licence.licenceRef,
        financialAgreementId
      })

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                ID: '10064842',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }, {
                ID: '10064843',
                purposePoints: [
                  {
                    point_detail: {
                      NGR1_EAST: '69212',
                      NGR2_EAST: 'null',
                      NGR3_EAST: 'null',
                      NGR4_EAST: 'null',
                      LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE',
                      NGR1_NORTH: '50394',
                      NGR1_SHEET: 'TQ',
                      NGR2_NORTH: 'null',
                      NGR2_SHEET: 'null',
                      NGR3_NORTH: 'null',
                      NGR3_SHEET: 'null',
                      NGR4_NORTH: 'null',
                      NGR4_SHEET: 'null'
                    }
                  }]
              }]
            }
          }
        }
      })
    })

    it('fetches the data and returns an array with two entries', async () => {
      const result = await FetchAbstractionDataReturnRequirementsService.go(licence.id)

      expect(result).to.equal([{
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Spray Irrigation - Storage',
        returnsFrequency: 'daily',
        reportingFrequency: 'monthly',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }, {
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 1,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPoint: 'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        isSummer: false,
        purposeDescription: 'Mineral Washing',
        returnsFrequency: 'daily',
        reportingFrequency: 'weekly',
        siteDescription: 'RIVER MEDWAY AT YALDING INTAKE'
      }])
    })
  })
})

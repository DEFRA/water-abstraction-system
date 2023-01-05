'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')

describe('Fetch Charge Versions service', () => {
  const { regionId } = LicenceHelper.defaults()
  let testRecords
  let billingPeriod

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are licences to be included in supplementary billing', () => {
    let billingChargeCategory
    let chargeElement
    let chargePurpose

    beforeEach(async () => {
      billingPeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31')
      }

      // This creates an SROC charge version linked to a licence marked for supplementary billing
      const srocChargeVersion = await ChargeVersionHelper.add(
        {},
        { includeInSupplementaryBilling: 'yes' }
      )

      // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
      const alcsChargeVersion = await ChargeVersionHelper.add(
        { scheme: 'alcs' },
        { includeInSupplementaryBilling: 'yes' }
      )

      testRecords = [srocChargeVersion, alcsChargeVersion]

      billingChargeCategory = await BillingChargeCategoryHelper.add()

      chargeElement = await ChargeElementHelper.add({
        chargeVersionId: srocChargeVersion.chargeVersionId,
        billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId
      })

      chargePurpose = await ChargePurposeHelper.add({
        chargeElementId: chargeElement.chargeElementId
      })
    })

    it('returns only the current SROC charge versions that are applicable', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(result.length).to.equal(1)
      expect(result[0].chargeVersionId).to.equal(testRecords[0].chargeVersionId)
    })

    it('includes related charge elements, billing charge category and charge purposes', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      const expectedResult = {
        chargeElementId: chargeElement.chargeElementId,
        billingChargeCategory: {
          reference: billingChargeCategory.reference
        },
        chargePurposes: [{
          chargePurposeId: chargePurpose.chargePurposeId,
          abstractionPeriodStartDay: chargePurpose.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: chargePurpose.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: chargePurpose.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: chargePurpose.abstractionPeriodEndMonth
        }]
      }

      expect(result.length).to.equal(1)
      expect(result[0].chargeVersionId).to.equal(testRecords[0].chargeVersionId)
      expect(result[0].chargeElements[0]).to.equal(expectedResult)
    })
  })

  describe('when there are no licences to be included in supplementary billing', () => {
    describe("because none of them are marked 'includeInSupplementaryBilling'", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        // This creates an SROC charge version linked to a licence. But the licence won't be marked for supplementary
        // billing
        const srocChargeVersion = await ChargeVersionHelper.add()
        testRecords = [srocChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.length).to.equal(0)
      })
    })

    describe("because all the applicable charge versions are 'alcs' (presroc)", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
        const alcsChargeVersion = await ChargeVersionHelper.add(
          { scheme: 'alcs' },
          { includeInSupplementaryBilling: 'yes' }
        )
        testRecords = [alcsChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.length).to.equal(0)
      })
    })

    describe('because there are no current charge versions', () => {
      describe('as they all have start dates before the billing period', () => {
        beforeEach(async () => {
          billingPeriod = {
            startDate: new Date('2022-04-01'),
            endDate: new Date('2023-03-31')
          }

          // This creates an SROC charge version with a start date before the billing period. This would have been
          // picked up by a previous bill run
          const alcsChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date(2022, 2, 31) }, // 2022-03-01 - Months are zero indexed :-)
            { includeInSupplementaryBilling: 'yes' }
          )
          testRecords = [alcsChargeVersion]
        })

        it('returns no applicable charge versions', async () => {
          const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(result.length).to.equal(0)
        })
      })

      describe('as they all have start dates after the billing period', () => {
        beforeEach(async () => {
          billingPeriod = {
            startDate: new Date('2022-04-01'),
            endDate: new Date('2023-03-31')
          }

          // This creates an SROC charge version with a start date after the billing period. This will be picked in
          // next years bill runs
          const alcsChargeVersion = await ChargeVersionHelper.add(
            { startDate: new Date(2023, 3, 1) }, // 2023-04-01 - Months are zero indexed :-)
            { includeInSupplementaryBilling: 'yes' }
          )
          testRecords = [alcsChargeVersion]
        })

        it('returns no applicable charge versions', async () => {
          const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(result.length).to.equal(0)
        })
      })
    })

    describe('because there are no licences linked to the selected region', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        // This creates an SROC charge version linked to a licence with an different region than selected
        const otherRegionChargeVersion = await ChargeVersionHelper.add(
          {},
          {
            includeInSupplementaryBilling: 'yes',
            regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73'
          }
        )
        testRecords = [otherRegionChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.length).to.equal(0)
      })
    })
  })
})

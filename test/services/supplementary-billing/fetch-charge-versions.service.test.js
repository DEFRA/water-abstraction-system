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
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const ChargeVersionWorkflowHelper = require('../../support/helpers/water/charge-version-workflow.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')

describe('Fetch Charge Versions service', () => {
  const licenceDefaults = LicenceHelper.defaults()

  let testRecords
  let billingPeriod
  let region
  let regionId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    region = await RegionHelper.add()
    regionId = region.regionId
  })

  describe('when there are licences to be included in supplementary billing', () => {
    let billingChargeCategory
    let chargeElement
    let chargePurpose
    let changeReason

    beforeEach(async () => {
      billingPeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31')
      }

      changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })

      // This creates an SROC charge version linked to a licence marked for supplementary billing
      const srocChargeVersion = await ChargeVersionHelper.add(
        { changeReasonId: changeReason.changeReasonId },
        { regionId, isWaterUndertaker: true, includeInSrocSupplementaryBilling: true }
      )

      // This creates an SROC charge version linked to a licence marked for supplementary billing
      // with a status of 'superseded'
      const srocSupersededChargeVersion = await ChargeVersionHelper.add(
        { changeReasonId: changeReason.changeReasonId, status: 'superseded' },
        { regionId, isWaterUndertaker: true, includeInSrocSupplementaryBilling: true }
      )

      // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
      const alcsChargeVersion = await ChargeVersionHelper.add(
        { scheme: 'alcs' },
        { regionId, includeInSupplementaryBilling: 'yes' }
      )

      testRecords = [srocChargeVersion, srocSupersededChargeVersion, alcsChargeVersion]

      billingChargeCategory = await BillingChargeCategoryHelper.add()

      chargeElement = await ChargeElementHelper.add({
        chargeVersionId: srocChargeVersion.chargeVersionId,
        billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId
      })

      chargePurpose = await ChargePurposeHelper.add({
        chargeElementId: chargeElement.chargeElementId
      })
    })

    it("returns only the 'current' SROC charge versions that are applicable", async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(result).to.have.length(1)
      expect(result[0].chargeVersionId).to.equal(testRecords[0].chargeVersionId)
    })

    it('includes related licence and region', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(result[0].licence.licenceRef).to.equal(licenceDefaults.licenceRef)
      expect(result[0].licence.isWaterUndertaker).to.equal(true)
      expect(result[0].licence.historicalAreaCode).to.equal(licenceDefaults.regions.historicalAreaCode)
      expect(result[0].licence.regionalChargeArea).to.equal(licenceDefaults.regions.regionalChargeArea)
      expect(result[0].licence.region.regionId).to.equal(regionId)
      expect(result[0].licence.region.chargeRegionId).to.equal(region.chargeRegionId)
    })

    it('includes related change reason', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(result[0].changeReason.triggersMinimumCharge).to.equal(changeReason.triggersMinimumCharge)
    })

    it('includes related charge elements, billing charge category and charge purposes', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      const expectedResult = {
        chargeElementId: chargeElement.chargeElementId,
        source: chargeElement.source,
        loss: chargeElement.loss,
        volume: chargeElement.volume,
        adjustments: chargeElement.adjustments,
        additionalCharges: chargeElement.additionalCharges,
        description: chargeElement.description,
        billingChargeCategory: {
          reference: billingChargeCategory.reference,
          shortDescription: billingChargeCategory.shortDescription
        },
        chargePurposes: [{
          chargePurposeId: chargePurpose.chargePurposeId,
          abstractionPeriodStartDay: chargePurpose.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: chargePurpose.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: chargePurpose.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: chargePurpose.abstractionPeriodEndMonth
        }]
      }

      expect(result).to.have.length(1)
      expect(result[0].chargeVersionId).to.equal(testRecords[0].chargeVersionId)
      expect(result[0].chargeElements[0]).to.equal(expectedResult)
    })
  })

  describe('when there are no licences to be included in supplementary billing', () => {
    describe("because none of them are marked 'includeInSrocSupplementaryBilling'", () => {
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

        expect(result).to.be.empty()
      })
    })

    describe("because all the applicable charge versions do not have a 'current' status", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const srocSupersededChargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded' },
          { regionId, isWaterUndertaker: true, includeInSrocSupplementaryBilling: true }
        )
        const srocDraftChargeVersion = await ChargeVersionHelper.add(
          { status: 'draft' },
          { regionId, isWaterUndertaker: true, includeInSrocSupplementaryBilling: true }
        )
        testRecords = [srocSupersededChargeVersion, srocDraftChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result).to.be.empty()
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

        expect(result).to.be.empty()
      })
    })

    describe('because all the applicable charge versions have no `invoiceAccountId`', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        // This creates a charge version with no `invoiceAccountId`
        const nullInvoiceAccountIdChargeVersion = await ChargeVersionHelper.add(
          { invoiceAccountId: null },
          { regionId, includeInSrocSupplementaryBilling: true }
        )
        testRecords = [nullInvoiceAccountIdChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result).to.be.empty()
      })
    })

    describe('because there are no charge versions in the billing period', () => {
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
            { includeInSrocSupplementaryBilling: true }
          )
          testRecords = [alcsChargeVersion]
        })

        it('returns no applicable charge versions', async () => {
          const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(result).to.be.empty()
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
            { includeInSrocSupplementaryBilling: true }
          )
          testRecords = [alcsChargeVersion]
        })

        it('returns no applicable charge versions', async () => {
          const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

          expect(result).to.be.empty()
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
            includeInSrocSupplementaryBilling: true,
            regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73'
          }
        )
        testRecords = [otherRegionChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result).to.be.empty()
      })
    })

    describe('because the licence is in workflow', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const chargeVersion = await ChargeVersionHelper.add(
          {},
          {
            includeInSrocSupplementaryBilling: true,
            regionId
          }
        )
        await ChargeVersionWorkflowHelper.add({ licenceId: chargeVersion.licenceId })

        testRecords = [chargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result).to.be.empty()
      })
    })
  })
})

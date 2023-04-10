'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const ChargeVersionWorkflowHelper = require('../../support/helpers/water/charge-version-workflow.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const FetchReplacedChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-replaced-charge-versions.service.js')

describe('Fetch Replaced Charge Versions service', () => {
  const billingBatchId = '245b47a3-69be-4b9d-aac3-04f1f7125385'
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
    beforeEach(async () => {
      billingPeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31')
      }

      // This creates an SROC charge version linked to a licence marked for supplementary billing
      const srocChargeVersion = await ChargeVersionHelper.add(
        {},
        { regionId, includeInSrocSupplementaryBilling: true }
      )

      // This creates an SROC charge version linked to a licence marked for supplementary billing
      // with a status of 'superseded'
      const srocSupersededChargeVersion = await ChargeVersionHelper.add(
        { status: 'superseded' },
        { regionId, isWaterUndertaker: true, includeInSrocSupplementaryBilling: true }
      )

      // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
      // with a status of 'superseded'
      const alcsChargeVersion = await ChargeVersionHelper.add(
        { scheme: 'alcs', status: 'superseded' },
        { regionId, includeInSupplementaryBilling: 'yes' }
      )

      testRecords = [srocChargeVersion, srocSupersededChargeVersion, alcsChargeVersion]
    })

    it("returns only the 'superseded' SROC charge versions that are applicable", async () => {
      const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

      expect(result.length).to.equal(1)
      expect(result[0].chargeVersionId).to.equal(testRecords[1].chargeVersionId)
    })

    it('includes related licence and region', async () => {
      const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

      expect(result[0].licence.licenceRef).to.equal(licenceDefaults.licenceRef)
      expect(result[0].licence.isWaterUndertaker).to.equal(true)
      expect(result[0].licence.historicalAreaCode).to.equal(licenceDefaults.regions.historicalAreaCode)
      expect(result[0].licence.regionalChargeArea).to.equal(licenceDefaults.regions.regionalChargeArea)
      expect(result[0].licence.region.regionId).to.equal(regionId)
      expect(result[0].licence.region.chargeRegionId).to.equal(region.chargeRegionId)
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
        const chargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded' },
          { regionId, includeInSrocSupplementaryBilling: false }
        )
        testRecords = [chargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

        expect(result.length).to.equal(0)
      })
    })

    describe("because all the applicable charge versions do not have a 'superseded' status", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const currentChargeVersion = await ChargeVersionHelper.add(
          { status: 'current' },
          { regionId, isWaterUndertaker: true, includeInSrocSupplementaryBilling: true }
        )
        const draftChargeVersion = await ChargeVersionHelper.add(
          { status: 'draft' },
          { regionId, isWaterUndertaker: true, includeInSrocSupplementaryBilling: true }
        )
        testRecords = [currentChargeVersion, draftChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

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
        const chargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded', scheme: 'alcs' },
          { regionId, includeInSrocSupplementaryBilling: true }
        )
        testRecords = [chargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

        expect(result.length).to.equal(0)
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
          const chargeVersion = await ChargeVersionHelper.add(
            { status: 'superseded', startDate: new Date(2022, 2, 31) }, // 2022-03-01 - Months are zero indexed :-)
            { regionId, includeInSrocSupplementaryBilling: true }
          )
          testRecords = [chargeVersion]
        })

        it('returns no applicable charge versions', async () => {
          const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

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
          const srocChargeVersion = await ChargeVersionHelper.add(
            { status: 'superseded', startDate: new Date(2023, 3, 1) }, // 2023-04-01 - Months are zero indexed :-)
            { regionId, includeInSrocSupplementaryBilling: true }
          )
          testRecords = [srocChargeVersion]
        })

        it('returns no applicable charge versions', async () => {
          const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

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
        const chargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded' },
          {
            regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73',
            includeInSrocSupplementaryBilling: true
          }
        )
        testRecords = [chargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

        expect(result.length).to.equal(0)
      })
    })

    describe('because the licence is in workflow', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const chargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded' },
          {
            regionId,
            includeInSrocSupplementaryBilling: true
          }
        )
        await ChargeVersionWorkflowHelper.add({ licenceId: chargeVersion.licenceId })

        testRecords = [chargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

        expect(result.length).to.equal(0)
      })
    })

    describe('because the replaced charge versions invoice accounts have already been processed', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const chargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded' },
          {
            regionId,
            includeInSrocSupplementaryBilling: true
          }
        )
        const { invoiceAccountId } = chargeVersion
        await BillingInvoiceHelper.add({ invoiceAccountId }, { billingBatchId })

        testRecords = [chargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)

        expect(result.length).to.equal(0)
      })
    })
  })
})

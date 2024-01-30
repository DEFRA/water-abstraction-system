'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../../support/helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/annual/fetch-charge-versions.service.js')

describe.only('Fetch Charge Versions service', () => {
  const licenceDefaults = LicenceHelper.defaults()
  const currentFinancialYear = _currentFinancialYear()

  let testRecords
  let billingPeriod
  let region
  let regionId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    region = await RegionHelper.add()
    regionId = region.id
  })

  describe('when there are some charge versions that should be considered for annual billing', () => {
    let chargeCategory
    let oldChargeReference
    let currentChargeReference
    let oldChargeElement
    let currentChargeElement
    let changeReason
    let licence

    beforeEach(async () => {
      billingPeriod = {
        startDate: new Date(currentFinancialYear.startYear, 3, 1),
        endDate: new Date(currentFinancialYear.endYear, 2, 31)
      }
      licence = await LicenceHelper.add({
        regionId,
        waterUndertaker: true,
        includeInSrocBilling: true,
        includeInPresrocBilling: 'yes'
      })
      changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })

      const { id: licenceId, licenceRef } = licence
      const { id: changeReasonId } = changeReason
      const billingAccountId = '77483323-daec-443e-912f-b87e1e9d0721'

      // This creates a 'current' charge version
      const currentChargeVersion = await ChargeVersionHelper.add(
        { startDate: new Date('2023-11-01'), changeReasonId, billingAccountId, licenceId, licenceRef }
      )

      // This creates a 'current' charge version which covers both FYE 2023 and 2024
      const oldChargeVersion = await ChargeVersionHelper.add(
        { endDate: new Date(currentFinancialYear.startYear - 1, 8, 12), changeReasonId, billingAccountId, licenceId, licenceRef }
      )

      // This creates a 'superseded' charge version
      const supersededChargeVersion = await ChargeVersionHelper.add(
        { changeReasonId, status: 'superseded', billingAccountId, licenceId, licenceRef }
      )

      // This creates a 'draft' charge version
      const draftChargeVersion = await ChargeVersionHelper.add(
        { changeReasonId, status: 'superseded', billingAccountId, licenceId, licenceRef }
      )

      // This creates a 'non-chargeable' charge version
      const nonChargeableChargeVersion = await ChargeVersionHelper.add(
        { billingAccountId: null, changeReasonId, licenceId, licenceRef }
      )

      // This creates an ALCS (presroc) charge version
      const alcsChargeVersion = await ChargeVersionHelper.add(
        { scheme: 'alcs', billingAccountId, licenceId, licenceRef }
      )

      testRecords = [
        currentChargeVersion,
        oldChargeVersion,
        supersededChargeVersion,
        draftChargeVersion,
        nonChargeableChargeVersion,
        alcsChargeVersion
      ]

      // We test that related data is returned in the results. So, we create and link it to the currentChargeVersion
      // ready for testing
      chargeCategory = await ChargeCategoryHelper.add()

      currentChargeReference = await ChargeReferenceHelper.add({
        chargeVersionId: currentChargeVersion.id,
        chargeCategoryId: chargeCategory.id
      })

      currentChargeElement = await ChargeElementHelper.add({
        chargeReferenceId: currentChargeReference.id
      })

      oldChargeReference = await ChargeReferenceHelper.add({
        chargeVersionId: oldChargeVersion.id,
        chargeCategoryId: chargeCategory.id
      })

      oldChargeElement = await ChargeElementHelper.add({
        chargeReferenceId: oldChargeReference.id
      })
    })

    describe('including those linked to soft-deleted workflow records', () => {
      beforeEach(async () => {
        await WorkflowHelper.add({ licenceId: licence.id, deletedAt: new Date('2022-04-01') })
      })

      it('returns the charge versions that are applicable', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.have.length(1)

        const chargeVersionIds = results.map((chargeVersion) => {
          return chargeVersion.id
        })

        expect(chargeVersionIds).to.include(testRecords[0].id)
        expect(chargeVersionIds).not.to.include(testRecords[1].id)
        expect(chargeVersionIds).not.to.include(testRecords[2].id)
        expect(chargeVersionIds).not.to.include(testRecords[3].id)
        expect(chargeVersionIds).not.to.include(testRecords[4].id)
      })
    })

    it("returns only 'current' charge versions that are applicable", async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results).to.have.length(1)

      const chargeVersionIds = results.map((chargeVersion) => {
        return chargeVersion.id
      })

      expect(chargeVersionIds).to.include(testRecords[0].id)
      expect(chargeVersionIds).not.to.include(testRecords[1].id)
      expect(chargeVersionIds).not.to.include(testRecords[2].id)
      expect(chargeVersionIds).not.to.include(testRecords[3].id)
      expect(chargeVersionIds).not.to.include(testRecords[4].id)
    })

    it('includes the related licence and region', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results[0].licence.licenceRef).to.equal(licence.licenceRef)
      expect(results[0].licence.waterUndertaker).to.equal(true)
      expect(results[0].licence.historicalAreaCode).to.equal(licenceDefaults.regions.historicalAreaCode)
      expect(results[0].licence.regionalChargeArea).to.equal(licenceDefaults.regions.regionalChargeArea)
      expect(results[0].licence.region.id).to.equal(regionId)
      expect(results[0].licence.region.chargeRegionId).to.equal(region.chargeRegionId)
    })

    it('includes the related change reason', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(results[0].changeReason.triggersMinimumCharge).to.equal(changeReason.triggersMinimumCharge)
    })

    it('includes the related charge references, charge category and charge elements', async () => {
      const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

      const expectedResult = {
        id: currentChargeReference.id,
        source: currentChargeReference.source,
        loss: currentChargeReference.loss,
        volume: currentChargeReference.volume,
        adjustments: currentChargeReference.adjustments,
        additionalCharges: currentChargeReference.additionalCharges,
        description: currentChargeReference.description,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription
        },
        chargeElements: [{
          id: currentChargeElement.id,
          abstractionPeriodStartDay: currentChargeElement.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: currentChargeElement.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: currentChargeElement.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: currentChargeElement.abstractionPeriodEndMonth
        }]
      }

      expect(results[0].chargeReferences[0]).to.equal(expectedResult)
    })
  })

  describe('when there are no charge version that should be considered for the annual bill run', () => {
    describe("because all the applicable charge versions have a 'draft' status", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date(currentFinancialYear.startYear, 3, 1),
          endDate: new Date(currentFinancialYear.endYear, 2, 31)
        }

        const { id: licenceId } = await LicenceHelper.add({ regionId })

        const srocDraftChargeVersion = await ChargeVersionHelper.add({ status: 'draft', licenceId })
        testRecords = [srocDraftChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe("because all of them are for the 'alcs' (presroc) scheme", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date(currentFinancialYear.startYear, 3, 1),
          endDate: new Date(currentFinancialYear.endYear, 2, 31)
        }

        const { id: licenceId } = await LicenceHelper.add({ regionId })

        // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
        const alcsChargeVersion = await ChargeVersionHelper.add({ scheme: 'alcs', licenceId })
        testRecords = [alcsChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because none of them have a `billingAccountId`', () => {
      let licenceId
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date(currentFinancialYear.startYear, 3, 1),
          endDate: new Date(currentFinancialYear.endYear, 2, 31)
        }

        const licence = await LicenceHelper.add({ regionId })

        licenceId = licence.id

        // This creates a charge version with no `billingAccountId`
        const nullBillingAccountIdChargeVersion = await ChargeVersionHelper
          .add({ billingAccountId: null, licenceId })
        testRecords = [nullBillingAccountIdChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they all have start dates after the billing period', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date(currentFinancialYear.startYear, 3, 1),
          endDate: new Date(currentFinancialYear.endYear, 2, 31)
        }

        const { id: licenceId } = await LicenceHelper.add({ regionId })

        // This creates an charge version with a start date after the billing period. This will be picked in
        // next years bill runs
        const chargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date(currentFinancialYear.endYear, 8, 15), licenceId }
        )
        testRecords = [chargeVersion]
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they are all linked to licences in a different region', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date(currentFinancialYear.startYear, 3, 1),
          endDate: new Date(currentFinancialYear.endYear, 2, 31)
        }

        const { id: licenceId } = await LicenceHelper.add({ regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73' })

        // This creates an charge version linked to a licence with an different region than selected
        const otherRegionChargeVersion = await ChargeVersionHelper.add({ licenceId })
        testRecords = [otherRegionChargeVersion]
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })

    describe('because they are all linked to licences in workflow', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date(currentFinancialYear.startYear, 3, 1),
          endDate: new Date(currentFinancialYear.endYear, 2, 31)
        }

        const { id: licenceId } = await LicenceHelper.add({ regionId })

        const chargeVersion = await ChargeVersionHelper.add({ licenceId })
        await WorkflowHelper.add({ licenceId })

        testRecords = [chargeVersion]
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const results = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(results).to.be.empty()
      })
    })
  })
})

// TODO: This was copied from app/services/bill-runs/determine-billing-periods.service.js. We should consider
// refactoring to a helper
function _currentFinancialYear () {
  // 01-APR to 31-MAR
  const financialPeriod = {
    start: { day: 1, month: 3 },
    end: { day: 31, month: 2 }
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  let startYear
  let endYear

  // IMPORTANT! getMonth returns an integer (0-11). So, January is represented as 0 and December as 11. This is why
  // financialPeriod.end.month is 2 rather than 3, even though we mean March
  if (currentDate.getMonth() <= financialPeriod.end.month) {
    // For example, if currentDate was 2022-02-15 it would fall in financial year 2021-04-01 to 2022-03-31
    startYear = currentYear - 1
    endYear = currentYear
  } else {
    // For example, if currentDate was 2022-06-15 it would fall in financial year 2022-04-01 to 2023-03-31
    startYear = currentYear
    endYear = currentYear + 1
  }

  return { startYear, endYear }
}

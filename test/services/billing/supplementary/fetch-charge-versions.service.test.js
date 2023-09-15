'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../../support/helpers/water/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/water/charge-category.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/water/charge-reference.helper.js')
const ChargePurposeHelper = require('../../../support/helpers/water/charge-purpose.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/water/charge-version.helper.js')
const WorkflowHelper = require('../../../support/helpers/water/workflow.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LicenceHelper = require('../../../support/helpers/water/licence.helper.js')
const RegionHelper = require('../../../support/helpers/water/region.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/billing/supplementary/fetch-charge-versions.service.js')

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

  describe('when there are charge versions that should be considered for the next supplementary billing', () => {
    let chargeCategory
    let chargeReference2023
    let chargeReference2023And24
    let chargeReference2024
    let chargePurpose2023
    let chargePurpose2023And24
    let chargePurpose2024
    let changeReason
    let licence

    beforeEach(async () => {
      billingPeriod = {
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31')
      }

      licence = await LicenceHelper.add({
        regionId,
        isWaterUndertaker: true,
        includeInSrocSupplementaryBilling: true,
        includeInSupplementaryBilling: 'yes'
      })
      const { licenceId } = licence
      changeReason = await ChangeReasonHelper.add({ triggersMinimumCharge: true })

      // This creates a 'current' SROC charge version which covers only FYE 2024
      const sroc2024ChargeVersion = await ChargeVersionHelper.add(
        { startDate: new Date('2023-11-01'), changeReasonId: changeReason.changeReasonId, licenceId }
      )

      // This creates a 'current' SROC charge version which covers both FYE 2023 and 2024
      const sroc2023And24ChargeVersion = await ChargeVersionHelper.add(
        { endDate: new Date('2023-10-31'), changeReasonId: changeReason.changeReasonId, licenceId }
      )

      // This creates a 'current' SROC charge version which covers only FYE 2023
      const sroc2023ChargeVersion = await ChargeVersionHelper.add(
        { endDate: new Date('2022-10-31'), changeReasonId: changeReason.changeReasonId, licenceId }
      )

      // This creates a 'superseded' SROC charge version
      const srocSupersededChargeVersion = await ChargeVersionHelper.add(
        { changeReasonId: changeReason.changeReasonId, status: 'superseded', licenceId }
      )

      // This creates an ALCS (presroc) charge version
      const alcsChargeVersion = await ChargeVersionHelper.add(
        { scheme: 'alcs', licenceId }
      )

      testRecords = [
        sroc2024ChargeVersion,
        sroc2023And24ChargeVersion,
        sroc2023ChargeVersion,
        srocSupersededChargeVersion,
        alcsChargeVersion
      ]

      // We test that related data is returned in the results. So, we create and link it to the srocChargeVersion
      // ready for testing
      chargeCategory = await ChargeCategoryHelper.add()

      chargeReference2024 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2024ChargeVersion.chargeVersionId,
        billingChargeCategoryId: chargeCategory.billingChargeCategoryId
      })

      chargePurpose2024 = await ChargePurposeHelper.add({
        chargeElementId: chargeReference2024.chargeElementId
      })

      chargeReference2023And24 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2023And24ChargeVersion.chargeVersionId,
        billingChargeCategoryId: chargeCategory.billingChargeCategoryId
      })

      chargePurpose2023And24 = await ChargePurposeHelper.add({
        chargeElementId: chargeReference2023And24.chargeElementId
      })

      chargeReference2023 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2023ChargeVersion.chargeVersionId,
        billingChargeCategoryId: chargeCategory.billingChargeCategoryId
      })

      chargePurpose2023 = await ChargePurposeHelper.add({
        chargeElementId: chargeReference2023.chargeElementId
      })
    })

    describe('including those linked to soft-deleted workflow records', () => {
      beforeEach(async () => {
        await WorkflowHelper.add({ licenceId: licence.licenceId, dateDeleted: new Date('2022-04-01') })
      })

      it('returns the SROC charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.chargeVersions).to.have.length(4)
        expect(result.chargeVersions[0].chargeVersionId).to.equal(testRecords[0].chargeVersionId)
        expect(result.chargeVersions[1].chargeVersionId).to.equal(testRecords[1].chargeVersionId)
        expect(result.chargeVersions[2].chargeVersionId).to.equal(testRecords[2].chargeVersionId)
        expect(result.chargeVersions[3].chargeVersionId).to.equal(testRecords[3].chargeVersionId)
      })

      it('returns the licenceIds from SROC charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.licenceIdsForPeriod).to.have.length(4)
        expect(result.licenceIdsForPeriod[0]).to.equal(licence.licenceId)
        expect(result.licenceIdsForPeriod[1]).to.equal(licence.licenceId)
        expect(result.licenceIdsForPeriod[2]).to.equal(licence.licenceId)
        expect(result.licenceIdsForPeriod[3]).to.equal(licence.licenceId)
      })
    })

    it("returns both 'current' and 'superseded' SROC charge version that are applicable", async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(result.chargeVersions).to.have.length(4)
      expect(result.chargeVersions[0].chargeVersionId).to.equal(testRecords[0].chargeVersionId)
      expect(result.chargeVersions[1].chargeVersionId).to.equal(testRecords[1].chargeVersionId)
      expect(result.chargeVersions[2].chargeVersionId).to.equal(testRecords[2].chargeVersionId)
      expect(result.chargeVersions[3].chargeVersionId).to.equal(testRecords[3].chargeVersionId)
    })

    it('includes the related licence and region', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(result.chargeVersions[0].licence.licenceRef).to.equal(licenceDefaults.licenceRef)
      expect(result.chargeVersions[0].licence.isWaterUndertaker).to.equal(true)
      expect(result.chargeVersions[0].licence.historicalAreaCode).to.equal(licenceDefaults.regions.historicalAreaCode)
      expect(result.chargeVersions[0].licence.regionalChargeArea).to.equal(licenceDefaults.regions.regionalChargeArea)
      expect(result.chargeVersions[0].licence.region.regionId).to.equal(regionId)
      expect(result.chargeVersions[0].licence.region.chargeRegionId).to.equal(region.chargeRegionId)
    })

    it('includes the related change reason', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      expect(result.chargeVersions[0].changeReason.triggersMinimumCharge).to.equal(changeReason.triggersMinimumCharge)
    })

    it('includes the related charge references, charge category and charge purposes', async () => {
      const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

      const expectedResult2024 = {
        chargeElementId: chargeReference2024.chargeElementId,
        source: chargeReference2024.source,
        loss: chargeReference2024.loss,
        volume: chargeReference2024.volume,
        adjustments: chargeReference2024.adjustments,
        additionalCharges: chargeReference2024.additionalCharges,
        description: chargeReference2024.description,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription
        },
        chargePurposes: [{
          chargePurposeId: chargePurpose2024.chargePurposeId,
          abstractionPeriodStartDay: chargePurpose2024.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: chargePurpose2024.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: chargePurpose2024.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: chargePurpose2024.abstractionPeriodEndMonth
        }]
      }

      const expectedResult2023And24 = {
        chargeElementId: chargeReference2023And24.chargeElementId,
        source: chargeReference2023And24.source,
        loss: chargeReference2023And24.loss,
        volume: chargeReference2023And24.volume,
        adjustments: chargeReference2023And24.adjustments,
        additionalCharges: chargeReference2023And24.additionalCharges,
        description: chargeReference2023And24.description,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription
        },
        chargePurposes: [{
          chargePurposeId: chargePurpose2023And24.chargePurposeId,
          abstractionPeriodStartDay: chargePurpose2023And24.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: chargePurpose2023And24.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: chargePurpose2023And24.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: chargePurpose2023And24.abstractionPeriodEndMonth
        }]
      }

      const expectedResult2023 = {
        chargeElementId: chargeReference2023.chargeElementId,
        source: chargeReference2023.source,
        loss: chargeReference2023.loss,
        volume: chargeReference2023.volume,
        adjustments: chargeReference2023.adjustments,
        additionalCharges: chargeReference2023.additionalCharges,
        description: chargeReference2023.description,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription
        },
        chargePurposes: [{
          chargePurposeId: chargePurpose2023.chargePurposeId,
          abstractionPeriodStartDay: chargePurpose2023.abstractionPeriodStartDay,
          abstractionPeriodStartMonth: chargePurpose2023.abstractionPeriodStartMonth,
          abstractionPeriodEndDay: chargePurpose2023.abstractionPeriodEndDay,
          abstractionPeriodEndMonth: chargePurpose2023.abstractionPeriodEndMonth
        }]
      }

      expect(result.chargeVersions[0].chargeReferences[0]).to.equal(expectedResult2024)
      expect(result.chargeVersions[1].chargeReferences[0]).to.equal(expectedResult2023And24)
      expect(result.chargeVersions[2].chargeReferences[0]).to.equal(expectedResult2023)
    })
  })

  describe('when there are no charge version that should be considered for the next supplementary billing', () => {
    describe("because none of them are linked to a licence flagged 'includeInSrocSupplementaryBilling'", () => {
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

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe("because all the applicable charge versions have a 'draft' status", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const { licenceId } = await LicenceHelper.add({
          regionId,
          isWaterUndertaker: true,
          includeInSrocSupplementaryBilling: true
        })

        const srocDraftChargeVersion = await ChargeVersionHelper.add({ status: 'draft', licenceId })
        testRecords = [srocDraftChargeVersion]
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe("because all of them are for the 'alcs' (presroc) scheme", () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const { licenceId } = await LicenceHelper.add({
          regionId,
          includeInSupplementaryBilling: true
        })

        // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
        const alcsChargeVersion = await ChargeVersionHelper.add({ scheme: 'alcs', licenceId })
        testRecords = [alcsChargeVersion]
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because none of them have an `invoiceAccountId`', () => {
      let licenceId
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const licence = await LicenceHelper.add({
          regionId,
          includeInSrocSupplementaryBilling: true
        })

        licenceId = licence.licenceId

        // This creates a charge version with no `invoiceAccountId`
        const nullInvoiceAccountIdChargeVersion = await ChargeVersionHelper
          .add({ invoiceAccountId: null, licenceId })
        testRecords = [nullInvoiceAccountIdChargeVersion]
      })

      it('returns the licenceId but no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.have.length(1)
        expect(result.licenceIdsForPeriod[0]).to.equal(licenceId)
      })
    })

    describe('because they all have start dates after the billing period', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const { licenceId } = await LicenceHelper.add({
          regionId,
          includeInSrocSupplementaryBilling: true
        })

        // This creates an SROC charge version with a start date after the billing period. This will be picked in
        // next years bill runs
        const srocChargeVersion = await ChargeVersionHelper.add(
          { startDate: new Date('2023-04-01'), licenceId }
        )
        testRecords = [srocChargeVersion]
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because the licences flagged for supplementary billing are linked to a different region', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const { licenceId } = await LicenceHelper.add({
          regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73',
          includeInSrocSupplementaryBilling: true
        })

        // This creates an SROC charge version linked to a licence with an different region than selected
        const otherRegionChargeVersion = await ChargeVersionHelper.add({ licenceId })
        testRecords = [otherRegionChargeVersion]
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because they are all linked to licences in workflow', () => {
      beforeEach(async () => {
        billingPeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }

        const { licenceId } = await LicenceHelper.add({
          regionId,
          includeInSrocSupplementaryBilling: true
        })

        const chargeVersion = await ChargeVersionHelper.add({ licenceId })
        await WorkflowHelper.add({ licenceId })

        testRecords = [chargeVersion]
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })
  })
})

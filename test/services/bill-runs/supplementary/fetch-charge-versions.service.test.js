'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChangeReasonHelper = require('../../../support/helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js')

const CHANGE_REASON_NEW_LICENCE_PART_INDEX = 10
const REGION_THAMES_INDEX = 6
const REGION_WALES_INDEX = 7

describe('Fetch Charge Versions service', () => {
  const billingPeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }
  const licenceDefaults = LicenceHelper.defaults()

  let changeReason
  let licence
  let region
  let testRecords

  before(async () => {
    changeReason = ChangeReasonHelper.select(CHANGE_REASON_NEW_LICENCE_PART_INDEX)
  })

  describe('when there are no charge version that should be considered for the next supplementary billing', () => {
    before(() => {
      region = RegionHelper.select(REGION_THAMES_INDEX)
    })

    describe('because they all have start dates after the billing period', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id, includeInSrocBilling: true })

        // This creates an SROC charge version with a start date after the billing period. This will be picked in
        // next years bill runs
        await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          startDate: new Date('2025-04-01')
        })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because the licences flagged for supplementary billing are linked to a different region', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({
          regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73',
          includeInSrocBilling: true
        })

        // This creates an SROC charge version linked to a licence with an different region than selected
        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because they are all linked to licences in workflow', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id, includeInSrocBilling: true })

        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })

        await WorkflowHelper.add({ licenceId: licence.id })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because none of them are linked to a licence flagged "includeInSrocBilling"', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: false, regionId: region.id })
        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because all the applicable charge versions have a "draft" status', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id, includeInSrocBilling: true })

        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef, status: 'draft' })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because all of them are for the "alcs" (presroc) scheme', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id, includeInPresrocBilling: 'yes' })

        // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef, scheme: 'alcs' })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.be.empty()
      })
    })

    describe('because none of them have a "billingAccountId"', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ regionId: region.id, includeInSrocBilling: true })

        // This creates a charge version with no `billingAccountId`
        await ChargeVersionHelper.add({ billingAccountId: null, licenceId: licence.id, licenceRef: licence.licenceRef })
      })

      it('returns the licenceId but no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.chargeVersions).to.be.empty()
        expect(result.licenceIdsForPeriod).to.have.length(1)
        expect(result.licenceIdsForPeriod[0]).to.equal(licence.id)
      })
    })
  })

  describe('when there are charge versions that should be considered for the next supplementary billing', () => {
    let chargeCategory
    let chargeReference2023
    let chargeReference2023And24
    let chargeReference2024
    let chargeElement2023
    let chargeElement2023And24
    let chargeElement2024
    let licence

    before(async () => {
      region = RegionHelper.select(REGION_WALES_INDEX)

      licence = await LicenceHelper.add({
        regionId: region.id,
        waterUndertaker: true,
        includeInSrocBilling: true,
        includeInPresrocBilling: 'yes'
      })

      const { id: licenceId, licenceRef } = licence
      const billingAccountId = '77483323-daec-443e-912f-b87e1e9d0721'

      // This creates a 'current' SROC charge version which covers only FYE 2024
      const sroc2024ChargeVersion = await ChargeVersionHelper.add({
        startDate: new Date('2023-11-01'),
        changeReasonId: changeReason.id,
        billingAccountId,
        licenceId,
        licenceRef
      })

      // This creates a 'current' SROC charge version which covers both FYE 2023 and 2024
      const sroc2023And24ChargeVersion = await ChargeVersionHelper.add({
        endDate: new Date('2023-10-31'),
        changeReasonId: changeReason.id,
        billingAccountId,
        licenceId,
        licenceRef
      })

      // This creates a 'current' SROC charge version which covers only FYE 2023
      const sroc2023ChargeVersion = await ChargeVersionHelper.add({
        endDate: new Date('2022-10-31'),
        changeReasonId: changeReason.id,
        billingAccountId,
        licenceId,
        licenceRef
      })

      // This creates a 'superseded' SROC charge version
      const srocSupersededChargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        status: 'superseded',
        billingAccountId,
        licenceId,
        licenceRef
      })

      // This creates an ALCS (presroc) charge version
      const alcsChargeVersion = await ChargeVersionHelper.add({
        scheme: 'alcs',
        billingAccountId,
        licenceId,
        licenceRef
      })

      testRecords = [
        sroc2024ChargeVersion,
        sroc2023And24ChargeVersion,
        sroc2023ChargeVersion,
        srocSupersededChargeVersion,
        alcsChargeVersion
      ]

      // We test that related data is returned in the results. So, we create and link it to the srocChargeVersion
      // ready for testing
      chargeCategory = ChargeCategoryHelper.select()

      chargeReference2024 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2024ChargeVersion.id,
        chargeCategoryId: chargeCategory.id
      })

      chargeElement2024 = await ChargeElementHelper.add({
        chargeReferenceId: chargeReference2024.id
      })

      chargeReference2023And24 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2023And24ChargeVersion.id,
        chargeCategoryId: chargeCategory.id
      })

      chargeElement2023And24 = await ChargeElementHelper.add({
        chargeReferenceId: chargeReference2023And24.id
      })

      chargeReference2023 = await ChargeReferenceHelper.add({
        chargeVersionId: sroc2023ChargeVersion.id,
        chargeCategoryId: chargeCategory.id
      })

      chargeElement2023 = await ChargeElementHelper.add({
        chargeReferenceId: chargeReference2023.id
      })
    })

    describe('including those linked to soft-deleted workflow records', () => {
      before(async () => {
        await WorkflowHelper.add({ licenceId: licence.id, deletedAt: new Date('2022-04-01') })
      })

      it('returns the SROC charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.chargeVersions).to.have.length(4)

        const chargeVersionIds = result.chargeVersions.map((chargeVersion) => {
          return chargeVersion.id
        })

        expect(chargeVersionIds).to.include(testRecords[0].id)
        expect(chargeVersionIds).to.include(testRecords[1].id)
        expect(chargeVersionIds).to.include(testRecords[2].id)
        expect(chargeVersionIds).to.include(testRecords[3].id)
      })

      it('returns a unique list of licenceIds from SROC charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

        expect(result.licenceIdsForPeriod).to.have.length(1)
        expect(result.licenceIdsForPeriod[0]).to.equal(licence.id)
      })
    })

    it('returns both "current" and "superseded" SROC charge version that are applicable', async () => {
      const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

      expect(result.chargeVersions).to.have.length(4)

      const chargeVersionIds = result.chargeVersions.map((chargeVersion) => {
        return chargeVersion.id
      })

      expect(chargeVersionIds).to.include(testRecords[0].id)
      expect(chargeVersionIds).to.include(testRecords[1].id)
      expect(chargeVersionIds).to.include(testRecords[2].id)
      expect(chargeVersionIds).to.include(testRecords[3].id)
    })

    it('includes the related licence and region', async () => {
      const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

      expect(result.chargeVersions[0].licence.licenceRef).to.equal(licence.licenceRef)
      expect(result.chargeVersions[0].licence.waterUndertaker).to.equal(true)
      expect(result.chargeVersions[0].licence.historicalAreaCode).to.equal(licenceDefaults.regions.historicalAreaCode)
      expect(result.chargeVersions[0].licence.regionalChargeArea).to.equal(licenceDefaults.regions.regionalChargeArea)
      expect(result.chargeVersions[0].licence.region.id).to.equal(region.id)
      expect(result.chargeVersions[0].licence.region.chargeRegionId).to.equal(region.chargeRegionId)
    })

    it('includes the related change reason', async () => {
      const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

      expect(result.chargeVersions[0].changeReason.triggersMinimumCharge).to.equal(changeReason.triggersMinimumCharge)
    })

    it('includes the related charge references, charge category and charge elements', async () => {
      const result = await FetchChargeVersionsService.go(region.id, billingPeriod)

      const expectedResult2024 = {
        id: chargeReference2024.id,
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
        chargeElements: [
          {
            id: chargeElement2024.id,
            abstractionPeriodStartDay: chargeElement2024.abstractionPeriodStartDay,
            abstractionPeriodStartMonth: chargeElement2024.abstractionPeriodStartMonth,
            abstractionPeriodEndDay: chargeElement2024.abstractionPeriodEndDay,
            abstractionPeriodEndMonth: chargeElement2024.abstractionPeriodEndMonth
          }
        ]
      }

      const expectedResult2023And24 = {
        id: chargeReference2023And24.id,
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
        chargeElements: [
          {
            id: chargeElement2023And24.id,
            abstractionPeriodStartDay: chargeElement2023And24.abstractionPeriodStartDay,
            abstractionPeriodStartMonth: chargeElement2023And24.abstractionPeriodStartMonth,
            abstractionPeriodEndDay: chargeElement2023And24.abstractionPeriodEndDay,
            abstractionPeriodEndMonth: chargeElement2023And24.abstractionPeriodEndMonth
          }
        ]
      }

      const expectedResult2023 = {
        id: chargeReference2023.id,
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
        chargeElements: [
          {
            id: chargeElement2023.id,
            abstractionPeriodStartDay: chargeElement2023.abstractionPeriodStartDay,
            abstractionPeriodStartMonth: chargeElement2023.abstractionPeriodStartMonth,
            abstractionPeriodEndDay: chargeElement2023.abstractionPeriodEndDay,
            abstractionPeriodEndMonth: chargeElement2023.abstractionPeriodEndMonth
          }
        ]
      }

      expect(result.chargeVersions[0].chargeReferences[0]).to.equal(expectedResult2024)
      expect(result.chargeVersions[1].chargeReferences[0]).to.equal(expectedResult2023And24)
      expect(result.chargeVersions[2].chargeReferences[0]).to.equal(expectedResult2023)
    })
  })
})

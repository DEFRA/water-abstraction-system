// Test framework
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ChangeReasonHelper from 'water-abstraction-engine/test/helpers/change-reason.helper.js'
import ChargeCategoryHelper from 'water-abstraction-engine/test/helpers/charge-category.helper.js'
import ChargeElementHelper from 'water-abstraction-engine/test/helpers/charge-element.helper.js'
import ChargeReferenceHelper from 'water-abstraction-engine/test/helpers/charge-reference.helper.js'
import ChargeVersionHelper from 'water-abstraction-engine/test/helpers/charge-version.helper.js'
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import WorkflowHelper from 'water-abstraction-engine/test/helpers/workflow.helper.js'

// Thing under test
import FetchChargeVersionsService from '../../../../src/services/bill-runs/supplementary/fetch-charge-versions.service.js'

const CHANGE_REASON_NEW_LICENCE_PART_INDEX = 10
const REGION_THAMES_INDEX = 6
const REGION_WALES_INDEX = 7

describe('Fetch Charge Versions service', () => {
  const billingPeriod = {
    endDate: new Date('2024-03-31'),
    startDate: new Date('2023-04-01')
  }
  const licenceDefaults = LicenceHelper.defaults()

  let changeReason
  let licence
  let region
  let testRecords

  beforeAll(async () => {
    changeReason = ChangeReasonHelper.select(CHANGE_REASON_NEW_LICENCE_PART_INDEX)
  })

  describe('when there are no charge version that should be considered for the next supplementary billing', () => {
    beforeAll(() => {
      region = RegionHelper.select(REGION_THAMES_INDEX)
    })

    describe('because they all have start dates after the billing period', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: true, regionId: region.id })

        // This creates an SROC charge version with a start date after the billing period. This will be picked in
        // next years bill runs
        await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          startDate: new Date('2025-04-01')
        })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.chargeVersions).toHaveLength(0)
        expect(result.licenceIdsForPeriod).toHaveLength(0)
      })
    })

    describe('because the licences flagged for supplementary billing are linked to a different region', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({
          includeInSrocBilling: true,
          regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73'
        })

        // This creates an SROC charge version linked to a licence with an different region than selected
        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.chargeVersions).toHaveLength(0)
        expect(result.licenceIdsForPeriod).toHaveLength(0)
      })
    })

    describe('because they are all linked to licences in workflow', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: true, regionId: region.id })

        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })

        await WorkflowHelper.add({ licenceId: licence.id })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.chargeVersions).toHaveLength(0)
        expect(result.licenceIdsForPeriod).toHaveLength(0)
      })
    })

    describe('because none of them are linked to a licence flagged "includeInSrocBilling"', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: false, regionId: region.id })
        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.chargeVersions).toHaveLength(0)
        expect(result.licenceIdsForPeriod).toHaveLength(0)
      })
    })

    describe('because all the applicable charge versions have a "draft" status', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: true, regionId: region.id })

        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef, status: 'draft' })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.chargeVersions).toHaveLength(0)
        expect(result.licenceIdsForPeriod).toHaveLength(0)
      })
    })

    describe('because all of them are for the "alcs" (presroc) scheme', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInPresrocBilling: 'yes', regionId: region.id })

        // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
        await ChargeVersionHelper.add({ licenceId: licence.id, licenceRef: licence.licenceRef, scheme: 'alcs' })
      })

      it('returns no applicable licenceIds or charge versions', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.chargeVersions).toHaveLength(0)
        expect(result.licenceIdsForPeriod).toHaveLength(0)
      })
    })

    describe('because none of them have a "billingAccountId"', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: true, regionId: region.id })

        // This creates a charge version with no `billingAccountId`
        await ChargeVersionHelper.add({ billingAccountId: null, licenceId: licence.id, licenceRef: licence.licenceRef })
      })

      it('returns the licenceId but no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.chargeVersions).toHaveLength(0)
        expect(result.licenceIdsForPeriod).toHaveLength(1)
        expect(result.licenceIdsForPeriod[0]).toEqual(licence.id)
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

    beforeAll(async () => {
      region = RegionHelper.select(REGION_WALES_INDEX)

      licence = await LicenceHelper.add({
        includeInPresrocBilling: 'yes',
        includeInSrocBilling: true,
        regionId: region.id,
        waterUndertaker: true
      })

      const { id: licenceId, licenceRef } = licence
      const billingAccountId = '77483323-daec-443e-912f-b87e1e9d0721'

      // This creates a 'current' SROC charge version which covers only FYE 2024
      const sroc2024ChargeVersion = await ChargeVersionHelper.add({
        billingAccountId,
        changeReasonId: changeReason.id,
        licenceId,
        licenceRef,
        startDate: new Date('2023-11-01')
      })

      // This creates a 'current' SROC charge version which covers both FYE 2023 and 2024
      const sroc2023And24ChargeVersion = await ChargeVersionHelper.add({
        billingAccountId,
        changeReasonId: changeReason.id,
        endDate: new Date('2023-10-31'),
        licenceId,
        licenceRef
      })

      // This creates a 'current' SROC charge version which covers only FYE 2023
      const sroc2023ChargeVersion = await ChargeVersionHelper.add({
        billingAccountId,
        changeReasonId: changeReason.id,
        endDate: new Date('2022-10-31'),
        licenceId,
        licenceRef
      })

      // This creates a 'superseded' SROC charge version
      const srocSupersededChargeVersion = await ChargeVersionHelper.add({
        billingAccountId,
        changeReasonId: changeReason.id,
        licenceId,
        licenceRef,
        status: 'superseded'
      })

      // This creates an ALCS (presroc) charge version
      const alcsChargeVersion = await ChargeVersionHelper.add({
        billingAccountId,
        licenceId,
        licenceRef,
        scheme: 'alcs'
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
        chargeCategoryId: chargeCategory.id,
        chargeVersionId: sroc2024ChargeVersion.id
      })

      chargeElement2024 = await ChargeElementHelper.add({
        chargeReferenceId: chargeReference2024.id
      })

      chargeReference2023And24 = await ChargeReferenceHelper.add({
        chargeCategoryId: chargeCategory.id,
        chargeVersionId: sroc2023And24ChargeVersion.id
      })

      chargeElement2023And24 = await ChargeElementHelper.add({
        chargeReferenceId: chargeReference2023And24.id
      })

      chargeReference2023 = await ChargeReferenceHelper.add({
        chargeCategoryId: chargeCategory.id,
        chargeVersionId: sroc2023ChargeVersion.id
      })

      chargeElement2023 = await ChargeElementHelper.add({
        chargeReferenceId: chargeReference2023.id
      })
    })

    describe('including those linked to soft-deleted workflow records', () => {
      beforeAll(async () => {
        await WorkflowHelper.add({ deletedAt: new Date('2022-04-01'), licenceId: licence.id })
      })

      it('returns the SROC charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.chargeVersions).toHaveLength(4)

        const chargeVersionIds = result.chargeVersions.map((chargeVersion) => {
          return chargeVersion.id
        })

        expect(chargeVersionIds).toContainEqual(testRecords[0].id)
        expect(chargeVersionIds).toContainEqual(testRecords[1].id)
        expect(chargeVersionIds).toContainEqual(testRecords[2].id)
        expect(chargeVersionIds).toContainEqual(testRecords[3].id)
      })

      it('returns a unique list of licenceIds from SROC charge versions that are applicable', async () => {
        const result = await FetchChargeVersionsService(region.id, billingPeriod)

        expect(result.licenceIdsForPeriod).toHaveLength(1)
        expect(result.licenceIdsForPeriod[0]).toEqual(licence.id)
      })
    })

    it('returns both "current" and "superseded" SROC charge version that are applicable', async () => {
      const result = await FetchChargeVersionsService(region.id, billingPeriod)

      expect(result.chargeVersions).toHaveLength(4)

      const chargeVersionIds = result.chargeVersions.map((chargeVersion) => {
        return chargeVersion.id
      })

      expect(chargeVersionIds).toContainEqual(testRecords[0].id)
      expect(chargeVersionIds).toContainEqual(testRecords[1].id)
      expect(chargeVersionIds).toContainEqual(testRecords[2].id)
      expect(chargeVersionIds).toContainEqual(testRecords[3].id)
    })

    it('includes the related licence and region', async () => {
      const result = await FetchChargeVersionsService(region.id, billingPeriod)

      expect(result.chargeVersions[0].licence.licenceRef).toEqual(licence.licenceRef)
      expect(result.chargeVersions[0].licence.waterUndertaker).toEqual(true)
      expect(result.chargeVersions[0].licence.historicalAreaCode).toEqual(licenceDefaults.regions.historicalAreaCode)
      expect(result.chargeVersions[0].licence.regionalChargeArea).toEqual(licenceDefaults.regions.regionalChargeArea)
      expect(result.chargeVersions[0].licence.region.id).toEqual(region.id)
      expect(result.chargeVersions[0].licence.region.chargeRegionId).toEqual(region.chargeRegionId)
    })

    it('includes the related change reason', async () => {
      const result = await FetchChargeVersionsService(region.id, billingPeriod)

      expect(result.chargeVersions[0].changeReason.triggersMinimumCharge).toEqual(changeReason.triggersMinimumCharge)
    })

    it('includes the related charge references, charge category and charge elements', async () => {
      const result = await FetchChargeVersionsService(region.id, billingPeriod)

      const expectedResult2024 = {
        additionalCharges: chargeReference2024.additionalCharges,
        adjustments: chargeReference2024.adjustments,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription
        },
        chargeElements: [
          {
            abstractionPeriodEndDay: chargeElement2024.abstractionPeriodEndDay,
            abstractionPeriodEndMonth: chargeElement2024.abstractionPeriodEndMonth,
            abstractionPeriodStartDay: chargeElement2024.abstractionPeriodStartDay,
            abstractionPeriodStartMonth: chargeElement2024.abstractionPeriodStartMonth,
            id: chargeElement2024.id
          }
        ],
        description: chargeReference2024.description,
        id: chargeReference2024.id,
        loss: chargeReference2024.loss,
        source: chargeReference2024.source,
        volume: chargeReference2024.volume
      }

      const expectedResult2023And24 = {
        additionalCharges: chargeReference2023And24.additionalCharges,
        adjustments: chargeReference2023And24.adjustments,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription
        },
        chargeElements: [
          {
            abstractionPeriodEndDay: chargeElement2023And24.abstractionPeriodEndDay,
            abstractionPeriodEndMonth: chargeElement2023And24.abstractionPeriodEndMonth,
            abstractionPeriodStartDay: chargeElement2023And24.abstractionPeriodStartDay,
            abstractionPeriodStartMonth: chargeElement2023And24.abstractionPeriodStartMonth,
            id: chargeElement2023And24.id
          }
        ],
        description: chargeReference2023And24.description,
        id: chargeReference2023And24.id,
        loss: chargeReference2023And24.loss,
        source: chargeReference2023And24.source,
        volume: chargeReference2023And24.volume
      }

      const expectedResult2023 = {
        additionalCharges: chargeReference2023.additionalCharges,
        adjustments: chargeReference2023.adjustments,
        chargeCategory: {
          reference: chargeCategory.reference,
          shortDescription: chargeCategory.shortDescription
        },
        chargeElements: [
          {
            abstractionPeriodEndDay: chargeElement2023.abstractionPeriodEndDay,
            abstractionPeriodEndMonth: chargeElement2023.abstractionPeriodEndMonth,
            abstractionPeriodStartDay: chargeElement2023.abstractionPeriodStartDay,
            abstractionPeriodStartMonth: chargeElement2023.abstractionPeriodStartMonth,
            id: chargeElement2023.id
          }
        ],
        description: chargeReference2023.description,
        id: chargeReference2023.id,
        loss: chargeReference2023.loss,
        source: chargeReference2023.source,
        volume: chargeReference2023.volume
      }

      expect(result.chargeVersions[0].chargeReferences[0]).toEqual(expectedResult2024)
      expect(result.chargeVersions[1].chargeReferences[0]).toEqual(expectedResult2023And24)
      expect(result.chargeVersions[2].chargeReferences[0]).toEqual(expectedResult2023)
    })
  })
})

// Test framework
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillingAccountHelper from '../../../support/helpers/billing-account.helper.js'
import BillingAccountModel from '../../../../app/models/billing-account.model.js'
import ChangeReasonHelper from '../../../support/helpers/change-reason.helper.js'
import ChargeCategoryHelper from '../../../support/helpers/charge-category.helper.js'
import ChargeElementHelper from '../../../support/helpers/charge-element.helper.js'
import ChargeReferenceHelper from '../../../support/helpers/charge-reference.helper.js'
import ChargeVersionHelper from '../../../support/helpers/charge-version.helper.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import RegionHelper from '../../../support/helpers/region.helper.js'
import WorkflowHelper from '../../../support/helpers/workflow.helper.js'

import { determineCurrentFinancialYear } from '../../../../app/lib/general.lib.js'

// Thing under test
import FetchBillingAccountsService from '../../../../app/services/bill-runs/annual/fetch-billing-accounts.service.js'

const CHANGE_REASON_NEW_LICENCE_PART_INDEX = 10
const REGION_ANGLIAN_INDEX = 0
const REGION_MIDLANDS_INDEX = 1

describe('Fetch Billing Accounts service', () => {
  const billingPeriod = determineCurrentFinancialYear()

  let billingAccount
  let licence
  let minimumChargeChangeReason
  let region

  beforeAll(async () => {
    minimumChargeChangeReason = ChangeReasonHelper.select(CHANGE_REASON_NEW_LICENCE_PART_INDEX)
  })

  describe('when the billing account should NOT be considered for the annual bill run', () => {
    beforeAll(() => {
      region = RegionHelper.select(REGION_MIDLANDS_INDEX)
    })

    beforeEach(async () => {
      licence = await LicenceHelper.add({ regionId: region.id })
      billingAccount = await BillingAccountHelper.add()
    })

    describe('because all their charge versions do not have a status of "current"', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({
          status: 'draft',
          billingAccountId: billingAccount.id,
          licenceId: licence.id
        })
      })

      it('does not return the billing account', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const hasBillingAccountId = results.some((result) => {
          return result.id === billingAccount.id
        })

        expect(hasBillingAccountId).toBe(false)
      })
    })

    describe('because all their charge versions are for the "alcs" (presroc) scheme', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({
          scheme: 'alcs',
          billingAccountId: billingAccount.id,
          licenceId: licence.id
        })
      })

      it('does not return the billing account', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const hasBillingAccountId = results.some((result) => {
          return result.id === billingAccount.id
        })

        expect(hasBillingAccountId).toBe(false)
      })
    })

    describe('because all their charge versions have start dates after the billing period', () => {
      beforeEach(async () => {
        const financialStartYear = billingPeriod.endDate.getFullYear()

        // This creates an charge version with a start date after the billing period
        await ChargeVersionHelper.add({
          startDate: new Date(financialStartYear, 8, 15),
          billingAccountId: billingAccount.id,
          licenceId: licence.id
        })
      })

      it('does not return the billing account', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const hasBillingAccountId = results.some((result) => {
          return result.id === billingAccount.id
        })

        expect(hasBillingAccountId).toBe(false)
      })
    })

    describe('because all their charge versions have end dates before the billing period', () => {
      beforeEach(async () => {
        const financialEndYear = billingPeriod.startDate.getFullYear()

        // This creates an charge version with a end date before the billing period starts
        await ChargeVersionHelper.add({
          endDate: new Date(financialEndYear, 2, 31),
          billingAccountId: billingAccount.id,
          licenceId: licence.id
        })
      })

      it('does not return the billing account', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const hasBillingAccountId = results.some((result) => {
          return result.id === billingAccount.id
        })

        expect(hasBillingAccountId).toBe(false)
      })
    })

    describe('because they are all linked to licences in a different region', () => {
      beforeEach(async () => {
        const { id: licenceId } = await LicenceHelper.add({ regionId: 'e117b501-e3c1-4337-ad35-21c60ed9ad73' })

        // This creates an charge version linked to a licence with an different region than selected
        await ChargeVersionHelper.add({ billingAccountId: billingAccount.id, licenceId })
      })

      it('does not return the billing account', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const hasBillingAccountId = results.some((result) => {
          return result.id === billingAccount.id
        })

        expect(hasBillingAccountId).toBe(false)
      })
    })

    describe('because they are all linked to licences that ended before the billing period', () => {
      beforeEach(async () => {
        const { id: licenceId } = await LicenceHelper.add({ revokedDate: new Date('2023-02-01') })

        // This creates a charge version linked to a licence that ends before the billing period
        await ChargeVersionHelper.add({ billingAccountId: billingAccount.id, licenceId })
      })

      it('does not return the billing account', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const hasBillingAccountId = results.some((result) => {
          return result.id === billingAccount.id
        })

        expect(hasBillingAccountId).toBe(false)
      })
    })

    describe('because they are all linked to licences in workflow', () => {
      beforeEach(async () => {
        await ChargeVersionHelper.add({ billingAccountId: billingAccount.id, licenceId: licence.id })
        await WorkflowHelper.add({ licenceId: licence.id })
      })

      it('does not return the billing account', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const hasBillingAccountId = results.some((result) => {
          return result.id === billingAccount.id
        })

        expect(hasBillingAccountId).toBe(false)
      })
    })
  })

  describe('when there are billing accounts that should be considered for annual billing', () => {
    let chargeCategory
    let chargeElement
    let chargeReference
    let chargeVersion

    beforeAll(async () => {
      region = RegionHelper.select(REGION_ANGLIAN_INDEX)
      licence = await LicenceHelper.add({ regionId: region.id })
      billingAccount = await BillingAccountHelper.add()

      chargeVersion = await ChargeVersionHelper.add({
        startDate: new Date('2023-11-01'),
        changeReasonId: minimumChargeChangeReason.id,
        billingAccountId: billingAccount.id,
        licenceId: licence.id,
        licenceRef: licence.licenceRef
      })

      chargeCategory = ChargeCategoryHelper.select()
      chargeReference = await ChargeReferenceHelper.add({
        chargeVersionId: chargeVersion.id,
        chargeCategoryId: chargeCategory.id
      })
      chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
    })

    it('returns the applicable billing account', async () => {
      const results = await FetchBillingAccountsService(region.id, billingPeriod)

      const billingAccountRecord = results.find((result) => {
        return result.id === billingAccount.id
      })

      expect(billingAccountRecord).toBeInstanceOf(BillingAccountModel)
      expect(billingAccountRecord.accountNumber).toEqual(billingAccount.accountNumber)
    })

    describe('that have applicable related charge versions', () => {
      it('includes the charge versions in each result', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const billingAccountRecord = results.find((result) => {
          return result.id === billingAccount.id
        })

        const { chargeVersions } = billingAccountRecord

        expect(chargeVersions[0].id).toEqual(chargeVersion.id)
        expect(chargeVersions[0].scheme).toEqual('sroc')
        expect(chargeVersions[0].startDate).toEqual(new Date('2023-11-01'))
        expect(chargeVersions[0].endDate).toBeNull()
        expect(chargeVersions[0].billingAccountId).toEqual(billingAccount.id)
        expect(chargeVersions[0].status).toEqual('current')
      })

      it('includes the licence and region in each result', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const billingAccountRecord = results.find((result) => {
          return result.id === billingAccount.id
        })

        const { licence } = billingAccountRecord.chargeVersions[0]

        expect(licence.id).toEqual(licence.id)
        expect(licence.licenceRef).toEqual(licence.licenceRef)
        expect(licence.waterUndertaker).toEqual(false)
        expect(licence.historicalAreaCode).toEqual('SAAR')
        expect(licence.regionalChargeArea).toEqual('Southern')
        expect(licence.region.id).toEqual(region.id)
        expect(licence.region.chargeRegionId).toEqual(region.chargeRegionId)
      })

      it('includes the change reason in each result', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const billingAccountRecord = results.find((result) => {
          return result.id === billingAccount.id
        })

        const { changeReason } = billingAccountRecord.chargeVersions[0]

        expect(changeReason.id).toEqual(changeReason.id)
        expect(changeReason.triggersMinimumCharge).toEqual(changeReason.triggersMinimumCharge)
      })

      it('includes the charge references, charge category and charge elements in each result', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const billingAccountRecord = results.find((result) => {
          return result.id === billingAccount.id
        })

        const { chargeReferences } = billingAccountRecord.chargeVersions[0]

        expect(chargeReferences).toHaveLength(1)

        expect(chargeReferences[0]).toEqual({
          id: chargeReference.id,
          source: 'non-tidal',
          loss: 'low',
          volume: 200,
          adjustments: {
            s126: null,
            s127: false,
            s130: false,
            charge: null,
            winter: false,
            aggregate: null
          },
          additionalCharges: null,
          description: 'Charge reference 1 - Mineral washing',
          chargeCategory: {
            id: chargeCategory.id,
            reference: chargeCategory.reference,
            shortDescription: chargeCategory.shortDescription
          },
          chargeElements: [
            {
              id: chargeElement.id,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3
            }
          ]
        })
      })
    })

    describe('that have inapplicable related charge versions', () => {
      beforeEach(async () => {
        const licenceInWorkflow = await LicenceHelper.add({ regionId: region.id })
        const { id: licenceInWorkflowId, licenceRef } = licenceInWorkflow

        await ChargeVersionHelper.add({
          billingAccountId: billingAccount.id,
          licenceId: licenceInWorkflowId,
          licenceRef
        })
        await WorkflowHelper.add({ licenceId: licenceInWorkflowId })
      })

      it('excludes the charge versions in each result', async () => {
        const results = await FetchBillingAccountsService(region.id, billingPeriod)

        const billingAccountRecord = results.find((result) => {
          return result.id === billingAccount.id
        })

        const { chargeVersions } = billingAccountRecord

        expect(chargeVersions).toHaveLength(1)
        expect(chargeVersions[0].id).toEqual(chargeVersion.id)
      })
    })
  })
})

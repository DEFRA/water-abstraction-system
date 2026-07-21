// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import BillingAccountHelper from '../../../support/helpers/billing-account.helper.js'
import BillingAccountModel from '../../../../app/models/billing-account.model.js'
import ChargeCategoryHelper from '../../../support/helpers/charge-category.helper.js'
import ChargeElementHelper from '../../../support/helpers/charge-element.helper.js'
import ChargeReferenceHelper from '../../../support/helpers/charge-reference.helper.js'
import ChargeVersionHelper from '../../../support/helpers/charge-version.helper.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import RegionHelper from '../../../support/helpers/region.helper.js'
import ReviewChargeElementHelper from '../../../support/helpers/review-charge-element.helper.js'
import ReviewChargeReferenceHelper from '../../../support/helpers/review-charge-reference.helper.js'
import ReviewChargeVersionHelper from '../../../support/helpers/review-charge-version.helper.js'
import ReviewLicenceHelper from '../../../support/helpers/review-licence.helper.js'

// Thing under test
import FetchBillingAccountsService from '../../../../app/services/bill-runs/two-part-tariff/fetch-billing-accounts.service.js'

// NOTE: These are declared outside the describe to make them accessible to our `_cleanUp()` function
let billRun
let billingAccount
let billingAccountNotInBillRun
let chargeElement
let chargeReference
let chargeVersion
let licence
let reviewChargeElement
let reviewChargeReference
let reviewChargeVersion

describe('Bill Runs - Two Part Tariff - Fetch Billing Accounts service', () => {
  let chargeCategory
  let region

  beforeAll(async () => {
    region = RegionHelper.select()
    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id })

    licence = await LicenceHelper.add({ regionId: region.id })

    billingAccount = await BillingAccountHelper.add()
    billingAccountNotInBillRun = await BillingAccountHelper.add()

    const reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id, licenceId: licence.id })
    const { id: reviewLicenceId } = reviewLicence

    chargeVersion = await ChargeVersionHelper.add({
      startDate: new Date('2023-11-01'),
      billingAccountId: billingAccount.id,
      licenceId: licence.id,
      licenceRef: licence.licenceRef
    })
    const { id: chargeVersionId } = chargeVersion

    reviewChargeVersion = await ReviewChargeVersionHelper.add({ chargeVersionId, reviewLicenceId })
    const { id: reviewChargeVersionId } = reviewChargeVersion

    chargeCategory = ChargeCategoryHelper.select()
    const { id: chargeCategoryId } = chargeCategory

    chargeReference = await ChargeReferenceHelper.add({ chargeVersionId, chargeCategoryId })
    const { id: chargeReferenceId } = chargeReference

    reviewChargeReference = await ReviewChargeReferenceHelper.add({ chargeReferenceId, reviewChargeVersionId })
    const { id: reviewChargeReferenceId } = reviewChargeReference

    chargeElement = await ChargeElementHelper.add({ chargeReferenceId })
    const { id: chargeElementId } = chargeElement

    reviewChargeElement = await ReviewChargeElementHelper.add({ chargeElementId, reviewChargeReferenceId })
  })

  afterAll(async () => {
    await _cleanUp()
  })

  describe('when there are billing accounts that are linked to the bill run', () => {
    it('returns the applicable billing accounts', async () => {
      const results = await FetchBillingAccountsService(billRun.id)

      expect(results).toHaveLength(1)

      expect(results[0]).toBeInstanceOf(BillingAccountModel)
      expect(results[0].id).toEqual(billingAccount.id)
      expect(results[0].accountNumber).toEqual(billingAccount.accountNumber)
    })

    describe('and each billing account', () => {
      describe('for the charge versions property', () => {
        it('returns the applicable charge versions', async () => {
          const results = await FetchBillingAccountsService(billRun.id)

          const { chargeVersions } = results[0]

          expect(chargeVersions[0].id).toEqual(chargeVersion.id)
          expect(chargeVersions[0].scheme).toEqual('sroc')
          expect(chargeVersions[0].startDate).toEqual(new Date('2023-11-01'))
          expect(chargeVersions[0].endDate).toBeNull()
          expect(chargeVersions[0].billingAccountId).toEqual(billingAccount.id)
          expect(chargeVersions[0].status).toEqual('current')
        })

        describe('and against each charge version', () => {
          it('includes the licence', async () => {
            const results = await FetchBillingAccountsService(billRun.id)

            const { licence } = results[0].chargeVersions[0]

            expect(licence.id).toEqual(licence.id)
            expect(licence.licenceRef).toEqual(licence.licenceRef)
            expect(licence.waterUndertaker).toEqual(false)
            expect(licence.historicalAreaCode).toEqual('SAAR')
            expect(licence.regionalChargeArea).toEqual('Southern')
            expect(licence.region).toEqual({
              id: region.id,
              chargeRegionId: region.chargeRegionId
            })
          })

          it('includes the applicable charge references', async () => {
            const results = await FetchBillingAccountsService(billRun.id)

            const { chargeReferences } = results[0].chargeVersions[0]

            expect(chargeReferences[0].id).toEqual(chargeReference.id)
            expect(chargeReferences[0].source).toEqual('non-tidal')
            expect(chargeReferences[0].loss).toEqual('low')
            expect(chargeReferences[0].volume).toEqual(200)
            expect(chargeReferences[0].adjustments).toEqual({
              s126: null,
              s127: false,
              s130: false,
              charge: null,
              winter: false,
              aggregate: null
            })
            expect(chargeReferences[0].additionalCharges).toBeNull()
            expect(chargeReferences[0].description).toEqual('Charge reference 1 - Mineral washing')
          })

          describe('and against each charge reference', () => {
            it('includes the charge category', async () => {
              const results = await FetchBillingAccountsService(billRun.id)

              const { chargeCategory: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result.id).toEqual(chargeCategory.id)
              expect(result.reference).toEqual(chargeCategory.reference)
              expect(result.shortDescription).toEqual(chargeCategory.shortDescription)
            })

            it('includes the review charge references', async () => {
              const results = await FetchBillingAccountsService(billRun.id)

              const { reviewChargeReferences: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result[0].id).toEqual(reviewChargeReference.id)
              expect(result[0].amendedAggregate).toEqual(reviewChargeReference.amendedAggregate)
              expect(result[0].amendedChargeAdjustment).toEqual(reviewChargeReference.amendedChargeAdjustment)
              expect(result[0].amendedAuthorisedVolume).toEqual(reviewChargeReference.amendedAuthorisedVolume)
            })

            it('includes the charge elements', async () => {
              const results = await FetchBillingAccountsService(billRun.id)

              const { chargeElements: result } = results[0].chargeVersions[0].chargeReferences[0]

              expect(result[0].id).toEqual(chargeElement.id)
              expect(result[0].abstractionPeriodStartDay).toEqual(chargeElement.abstractionPeriodStartDay)
              expect(result[0].abstractionPeriodStartMonth).toEqual(chargeElement.abstractionPeriodStartMonth)
              expect(result[0].abstractionPeriodEndDay).toEqual(chargeElement.abstractionPeriodEndDay)
              expect(result[0].abstractionPeriodEndMonth).toEqual(chargeElement.abstractionPeriodEndMonth)
            })

            describe('and against each charge element', () => {
              it('includes the review charge elements', async () => {
                const results = await FetchBillingAccountsService(billRun.id)

                const { reviewChargeElements: result } =
                  results[0].chargeVersions[0].chargeReferences[0].chargeElements[0]

                expect(result[0].id).toEqual(reviewChargeElement.id)
                expect(result[0].amendedAllocated).toEqual(reviewChargeElement.amendedAllocated)
              })
            })
          })
        })
      })
    })
  })

  describe('when there are billing accounts not linked to the bill run', () => {
    it('does not include them in the results', async () => {
      const results = await FetchBillingAccountsService(billRun.id)

      expect(results).toHaveLength(1)

      expect(results[0]).toBeInstanceOf(BillingAccountModel)
      expect(results[0].id).not.toEqual(billingAccountNotInBillRun.id)
    })
  })

  describe('when there are no billing accounts at all (no results)', () => {
    it('returns no results', async () => {
      const results = await FetchBillingAccountsService('1c1f7af5-9cba-47a7-8fc4-2c03b0d1124d')

      expect(results).toHaveLength(0)
    })
  })
})

async function _cleanUp() {
  if (billingAccount) await billingAccount.$query().delete()
  if (billingAccountNotInBillRun) await billingAccountNotInBillRun.$query().delete()
  if (chargeElement) await chargeElement.$query().delete()
  if (chargeReference) await chargeReference.$query().delete()
  if (chargeVersion) await chargeVersion.$query().delete()
  if (licence) await licence.$query().delete()
  if (reviewChargeElement) await reviewChargeElement.$query().delete()
  if (reviewChargeReference) await reviewChargeReference.$query().delete()
  if (reviewChargeVersion) await reviewChargeVersion.$query().delete()
  if (billRun) await billRun.$query().delete()
}

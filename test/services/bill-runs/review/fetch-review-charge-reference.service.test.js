// Test helpers
import BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import ChargeCategoryHelper from '../../../support/helpers/charge-category.helper.js'
import ChargeElementHelper from '../../../support/helpers/charge-element.helper.js'
import ChargeReferenceHelper from '../../../support/helpers/charge-reference.helper.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import RegionHelper from '../../../support/helpers/region.helper.js'
import ReviewChargeElementHelper from '../../../support/helpers/review-charge-element.helper.js'
import ReviewChargeReferenceHelper from '../../../support/helpers/review-charge-reference.helper.js'
import ReviewChargeVersionHelper from '../../../support/helpers/review-charge-version.helper.js'
import ReviewLicenceHelper from '../../../support/helpers/review-licence.helper.js'

// Thing under test
import FetchReviewChargeReferenceService from '../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js'

describe('Bill Runs Review - Fetch Review Charge Reference service', () => {
  let billRun
  let chargeCategory
  let chargeElement
  let chargeReference
  let licence
  let reviewChargeElement
  let reviewChargeVersion
  let reviewChargeReference
  let reviewLicence

  beforeAll(async () => {
    const region = RegionHelper.select()

    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, status: 'review' })

    chargeCategory = ChargeCategoryHelper.select()
    chargeReference = await ChargeReferenceHelper.add({
      additionalCharges: { isSupplyPublicWater: true, supportedSource: { name: 'Foo source' } },
      chargeCategoryId: chargeCategory.id
    })
    chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
    licence = await LicenceHelper.add()

    reviewLicence = await ReviewLicenceHelper.add({
      billRunId: billRun.id,
      licenceId: licence.id,
      licenceRef: licence.licenceRef
    })

    reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId: reviewLicence.id })
    reviewChargeReference = await ReviewChargeReferenceHelper.add({
      chargeReferenceId: chargeReference.id,
      reviewChargeVersionId: reviewChargeVersion.id
    })
    reviewChargeElement = await ReviewChargeElementHelper.add({
      chargeElementId: chargeElement.id,
      reviewChargeReferenceId: reviewChargeReference.id
    })
  })

  describe('when a matching review charge reference exists', () => {
    it('returns the match', async () => {
      const result = await FetchReviewChargeReferenceService(reviewChargeReference.id)

      expect(result).toEqual({
        id: reviewChargeReference.id,
        abatementAgreement: 1,
        aggregate: 1,
        amendedAggregate: 1,
        amendedAuthorisedVolume: 0,
        amendedChargeAdjustment: 1,
        canalAndRiverTrustAgreement: false,
        chargeAdjustment: 1,
        twoPartTariffAgreement: false,
        winterDiscount: false,
        reviewChargeVersion: {
          id: reviewChargeVersion.id,
          chargePeriodStartDate: new Date('2022-04-01'),
          chargePeriodEndDate: new Date('2022-06-05'),
          reviewLicence: {
            id: reviewLicence.id,
            billRun: {
              id: billRun.id,
              toFinancialYearEnding: 2023
            },
            licence: {
              id: licence.id,
              waterUndertaker: false
            }
          }
        },
        reviewChargeElements: [
          {
            id: reviewChargeElement.id,
            amendedAllocated: 0
          }
        ],
        chargeReference: {
          id: chargeReference.id,
          volume: 6.819,
          loss: 'low',
          supportedSourceName: 'Foo source',
          waterCompanyCharge: true,
          chargeCategory: {
            id: chargeCategory.id,
            reference: chargeCategory.reference,
            shortDescription: chargeCategory.shortDescription
          }
        }
      })
    })
  })

  describe('when no matching review charge reference exists', () => {
    it('returns nothing', async () => {
      const result = await FetchReviewChargeReferenceService('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).toBeUndefined()
    })
  })
})

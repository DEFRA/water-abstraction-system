'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Thing under test
const FetchReviewChargeReferenceService = require('../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js')

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

  before(async () => {
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
      billRunId: billRun.id, licenceId: licence.id, licenceRef: licence.licenceRef
    })

    reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId: reviewLicence.id })
    reviewChargeReference = await ReviewChargeReferenceHelper.add({
      chargeReferenceId: chargeReference.id,
      reviewChargeVersionId: reviewChargeVersion.id
    })
    reviewChargeElement = await ReviewChargeElementHelper.add({
      chargeElementId: chargeElement.id, reviewChargeReferenceId: reviewChargeReference.id
    })
  })

  describe('when a matching review charge reference exists', () => {
    it('returns the match', async () => {
      const result = await FetchReviewChargeReferenceService.go(reviewChargeReference.id)

      expect(result).to.equal({
        id: reviewChargeReference.id,
        abatementAgreement: 1,
        aggregate: 1,
        amendedAggregate: 1,
        amendedAuthorisedVolume: 50,
        amendedChargeAdjustment: 1,
        canalAndRiverTrustAgreement: false,
        chargeAdjustment: 1,
        twoPartTariffAgreement: true,
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
          waterCompanyCharge: 'true',
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
      const result = await FetchReviewChargeReferenceService.go('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).to.be.undefined()
    })
  })
})

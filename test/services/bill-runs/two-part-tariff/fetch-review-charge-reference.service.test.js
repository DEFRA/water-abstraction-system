'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')

// Thing under test
const FetchReviewChargeReferenceService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-charge-reference.service.js')

describe('Fetch Review Charge Reference service', () => {
  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is a valid bill run', () => {
    let billRun

    beforeEach(async () => {
      billRun = await BillRunHelper.add()
    })

    describe('and a valid review charge reference', () => {
      let reviewChargeReference
      let chargeReference
      let reviewChargeVersion
      let reviewChargeElement
      let chargeCategory

      beforeEach(async () => {
        reviewChargeVersion = await ReviewChargeVersionHelper.add()
        chargeCategory = ChargeCategoryHelper.select()
        chargeReference = await ChargeReferenceHelper.add({
          chargeCategoryId: chargeCategory.id,
          additionalCharges: {
            isSupplyPublicWater: true,
            supportedSource: {
              name: 'Thames'
            }
          }
        })
        reviewChargeReference = await ReviewChargeReferenceHelper.add({
          reviewChargeVersionId: reviewChargeVersion.id,
          chargeReferenceId: chargeReference.id
        })
        reviewChargeElement = await ReviewChargeElementHelper.add({ reviewChargeReferenceId: reviewChargeReference.id })
      })

      it('returns details of the bill run', async () => {
        const result = await FetchReviewChargeReferenceService.go(billRun.id, reviewChargeReference.id)

        expect(result.billRun).to.equal({
          id: billRun.id,
          toFinancialYearEnding: billRun.toFinancialYearEnding
        })
      })

      it('returns details of the review charge reference', async () => {
        const result = await FetchReviewChargeReferenceService.go(billRun.id, reviewChargeReference.id)

        expect(result.reviewChargeReference).to.equal({
          id: reviewChargeReference.id,
          reviewChargeVersionId: reviewChargeVersion.id,
          chargeReferenceId: chargeReference.id,
          aggregate: reviewChargeReference.aggregate,
          createdAt: reviewChargeReference.createdAt,
          updatedAt: reviewChargeReference.updatedAt,
          amendedAggregate: reviewChargeReference.amendedAggregate,
          chargeAdjustment: reviewChargeReference.chargeAdjustment,
          amendedChargeAdjustment: reviewChargeReference.amendedChargeAdjustment,
          abatementAgreement: reviewChargeReference.abatementAgreement,
          winterDiscount: reviewChargeReference.winterDiscount,
          twoPartTariffAgreement: reviewChargeReference.twoPartTariffAgreement,
          canalAndRiverTrustAgreement: reviewChargeReference.canalAndRiverTrustAgreement,
          authorisedVolume: reviewChargeReference.authorisedVolume,
          amendedAuthorisedVolume: reviewChargeReference.amendedAuthorisedVolume,
          reviewChargeVersion: {
            chargePeriodStartDate: reviewChargeVersion.chargePeriodStartDate,
            chargePeriodEndDate: reviewChargeVersion.chargePeriodEndDate
          },
          reviewChargeElements: [{
            amendedAllocated: reviewChargeElement.amendedAllocated
          }],
          chargeReference: {
            volume: chargeReference.volume,
            chargeCategoryId: chargeCategory.id,
            supportedSourceName: chargeReference.additionalCharges.supportedSource.name,
            waterCompanyCharge: `${chargeReference.additionalCharges.isSupplyPublicWater}`,
            chargeCategory: {
              reference: chargeCategory.reference,
              shortDescription: chargeCategory.shortDescription
            }
          }
        })
      })
    })
  })
})

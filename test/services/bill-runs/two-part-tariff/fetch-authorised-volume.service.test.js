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
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')

// Thing under test
const FetchAuthorisedVolumeService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-authorised-volume.service.js')

describe('Fetch Authorised Volume service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is a valid bull run', () => {
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
        chargeReference = await ChargeReferenceHelper.add({ chargeCategoryId: chargeCategory.id })
        reviewChargeReference = await ReviewChargeReferenceHelper.add({
          reviewChargeVersionId: reviewChargeVersion.id,
          chargeReferenceId: chargeReference.id
        })
        reviewChargeElement = await ReviewChargeElementHelper.add({ reviewChargeReferenceId: reviewChargeReference.id })
      })

      it('returns details of the bill run', async () => {
        const result = await FetchAuthorisedVolumeService.go(billRun.id, reviewChargeReference.id)

        expect(result.billRun).to.equal({
          id: billRun.id,
          toFinancialYearEnding: billRun.toFinancialYearEnding
        })
      })

      it('returns details of the review charge reference', async () => {
        const result = await FetchAuthorisedVolumeService.go(billRun.id, reviewChargeReference.id)

        expect(result.reviewChargeReference).to.equal({
          id: reviewChargeReference.id,
          amendedAuthorisedVolume: reviewChargeReference.amendedAuthorisedVolume,
          chargeReference: {
            chargeCategoryId: chargeCategory.id,
            chargeCategory: {
              shortDescription: chargeCategory.shortDescription,
              maxVolume: chargeCategory.maxVolume,
              minVolume: chargeCategory.minVolume
            }
          },
          reviewChargeElements: [{
            amendedAllocated: reviewChargeElement.amendedAllocated
          }],
          reviewChargeVersion: {
            chargePeriodStartDate: reviewChargeVersion.chargePeriodStartDate,
            chargePeriodEndDate: reviewChargeVersion.chargePeriodEndDate
          }
        })
      })
    })
  })
})

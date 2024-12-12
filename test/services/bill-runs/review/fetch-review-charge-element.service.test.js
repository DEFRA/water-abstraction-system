'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementReturnHelper = require('../../../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')
const ReviewReturnHelper = require('../../../support/helpers/review-return.helper.js')

// Thing under test
const FetchReviewChargeElementService = require('../../../../app/services/bill-runs/review/fetch-review-charge-element.service.js')

describe('Bill Runs Review - Fetch Review Charge Element service', () => {
  let billRun
  let chargeElement
  let returnLog
  let reviewChargeElement
  let reviewChargeVersion
  let reviewChargeReference
  let reviewLicence
  let reviewReturn

  before(async () => {
    const region = RegionHelper.select()

    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, status: 'review' })

    returnLog = await ReturnLogHelper.add()
    chargeElement = await ChargeElementHelper.add()

    reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id })
    reviewReturn = await ReviewReturnHelper.add({
      purposes: [
        {
          primary: { code: 'A', description: 'Agriculture' },
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
          secondary: { code: 'AGR', description: 'General Agriculture' }
        }
      ],
      returnId: returnLog.id,
      returnReference: returnLog.returnReference,
      reviewLicenceId: reviewLicence.id
    })

    reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId: reviewLicence.id })
    reviewChargeReference = await ReviewChargeReferenceHelper.add({ reviewChargeVersionId: reviewChargeVersion.id })
    reviewChargeElement = await ReviewChargeElementHelper.add({
      chargeElementId: chargeElement.id,
      reviewChargeReferenceId: reviewChargeReference.id
    })

    await ReviewChargeElementReturnHelper.add({
      reviewChargeElementId: reviewChargeElement.id,
      reviewReturnId: reviewReturn.id
    })
  })

  describe('when a matching review charge element exists', () => {
    it('returns the match', async () => {
      const result = await FetchReviewChargeElementService.go(reviewChargeElement.id)

      expect(result).to.equal({
        id: reviewChargeElement.id,
        amendedAllocated: 0,
        issues: '',
        status: 'ready',
        chargeElement: {
          id: chargeElement.id,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          authorisedAnnualQuantity: 200,
          description: 'Trickle Irrigation - Direct'
        },
        reviewChargeReference: {
          id: reviewChargeReference.id,
          amendedAuthorisedVolume: 0,
          reviewChargeElements: [
            {
              id: reviewChargeElement.id
            }
          ],
          reviewChargeVersion: {
            id: reviewChargeVersion.id,
            chargePeriodStartDate: new Date('2022-04-01'),
            chargePeriodEndDate: new Date('2022-06-05'),
            reviewLicence: {
              id: reviewLicence.id,
              licenceId: reviewLicence.licenceId,
              billRun: {
                id: billRun.id,
                toFinancialYearEnding: 2023
              }
            }
          }
        },
        reviewReturns: [
          {
            id: reviewReturn.id,
            allocated: 0,
            description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
            endDate: new Date('2022-05-06'),
            issues: '',
            quantity: 0,
            purposes: [
              {
                primary: { code: 'A', description: 'Agriculture' },
                tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
                secondary: { code: 'AGR', description: 'General Agriculture' }
              }
            ],
            returnId: reviewReturn.returnId,
            returnReference: reviewReturn.returnReference,
            returnStatus: 'completed',
            startDate: new Date('2022-04-01'),
            underQuery: false,
            returnLog: {
              id: returnLog.id,
              periodStartDay: 1,
              periodStartMonth: 4,
              periodEndDay: 28,
              periodEndMonth: 4
            }
          }
        ]
      })
    })
  })

  describe('when no matching review charge element exists', () => {
    it('returns nothing', async () => {
      const result = await FetchReviewChargeElementService.go('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).to.be.undefined()
    })
  })
})

// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import ChargeElementHelper from 'water-abstraction-engine/test/helpers/charge-element.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReviewChargeElementHelper from 'water-abstraction-engine/test/helpers/review-charge-element.helper.js'
import ReviewChargeElementReturnHelper from 'water-abstraction-engine/test/helpers/review-charge-element-return.helper.js'
import ReviewChargeReferenceHelper from 'water-abstraction-engine/test/helpers/review-charge-reference.helper.js'
import ReviewChargeVersionHelper from 'water-abstraction-engine/test/helpers/review-charge-version.helper.js'
import ReviewLicenceHelper from 'water-abstraction-engine/test/helpers/review-licence.helper.js'
import ReviewReturnHelper from 'water-abstraction-engine/test/helpers/review-return.helper.js'

// Thing under test
import FetchReviewChargeElementService from '../../../../src/services/bill-runs/review/fetch-review-charge-element.service.js'

describe('Bill Runs Review - Fetch Review Charge Element service', () => {
  let billRun
  let chargeElement
  let returnLog
  let reviewChargeElement
  let reviewChargeVersion
  let reviewChargeReference
  let reviewLicence
  let reviewReturn

  beforeAll(async () => {
    const region = RegionHelper.select()

    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, status: 'review' })

    returnLog = await ReturnLogHelper.add()
    chargeElement = await ChargeElementHelper.add()

    reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id })
    reviewReturn = await ReviewReturnHelper.add({
      purposes: [
        {
          primary: { code: 'A', description: 'Agriculture' },
          secondary: { code: 'AGR', description: 'General Agriculture' },
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' }
        }
      ],
      returnId: returnLog.returnId,
      returnLogId: returnLog.id,
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
      const result = await FetchReviewChargeElementService(reviewChargeElement.id)

      expect(result).toEqual({
        amendedAllocated: 0,
        chargeElement: {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          authorisedAnnualQuantity: 200,
          description: 'Mineral washing',
          id: chargeElement.id
        },
        id: reviewChargeElement.id,
        issues: '',
        reviewChargeReference: {
          amendedAuthorisedVolume: 0,
          id: reviewChargeReference.id,
          reviewChargeElements: [
            {
              id: reviewChargeElement.id
            }
          ],
          reviewChargeVersion: {
            chargePeriodEndDate: new Date('2022-06-05'),
            chargePeriodStartDate: new Date('2022-04-01'),
            id: reviewChargeVersion.id,
            reviewLicence: {
              billRun: {
                id: billRun.id,
                toFinancialYearEnding: 2023
              },
              id: reviewLicence.id,
              licenceId: reviewLicence.licenceId
            }
          }
        },
        reviewReturns: [
          {
            allocated: 0,
            description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
            endDate: new Date('2022-05-06'),
            id: reviewReturn.id,
            issues: '',
            purposes: [
              {
                primary: { code: 'A', description: 'Agriculture' },
                secondary: { code: 'AGR', description: 'General Agriculture' },
                tertiary: { code: '400', description: 'Spray Irrigation - Direct' }
              }
            ],
            quantity: 0,
            returnId: reviewReturn.returnId,
            returnLog: {
              id: returnLog.id,
              periodEndDay: 28,
              periodEndMonth: 4,
              periodStartDay: 1,
              periodStartMonth: 4,
              returnId: returnLog.returnId
            },
            returnLogId: reviewReturn.returnLogId,
            returnReference: reviewReturn.returnReference,
            returnStatus: 'completed',
            startDate: new Date('2022-04-01'),
            underQuery: false
          }
        ],
        status: 'ready'
      })
    })
  })

  describe('when no matching review charge element exists', () => {
    it('returns nothing', async () => {
      const result = await FetchReviewChargeElementService('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).toBeUndefined()
    })
  })
})

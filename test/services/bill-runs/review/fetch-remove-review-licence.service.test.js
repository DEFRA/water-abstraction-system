// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import RegionHelper from '../../../support/helpers/region.helper.js'
import ReviewLicenceHelper from '../../../support/helpers/review-licence.helper.js'

// Thing under test
import FetchRemoveReviewLicenceService from '../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js'

describe('Bill Runs - Review - Fetch Remove Review Licence service', () => {
  let billRun
  let region
  let reviewLicence

  beforeAll(async () => {
    region = RegionHelper.select()

    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, status: 'review' })

    reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id })
  })

  describe('when a matching review licence exists', () => {
    it('returns the match', async () => {
      const result = await FetchRemoveReviewLicenceService(reviewLicence.id)

      expect(result).toEqual({
        id: reviewLicence.id,
        licenceId: reviewLicence.licenceId,
        licenceRef: reviewLicence.licenceRef,
        billRun: {
          id: billRun.id,
          batchType: billRun.batchType,
          billRunNumber: billRun.billRunNumber,
          createdAt: billRun.createdAt,
          status: 'review',
          toFinancialYearEnding: billRun.toFinancialYearEnding,
          region: {
            id: region.id,
            displayName: region.displayName
          }
        }
      })
    })
  })

  describe('when no matching review licence exists', () => {
    it('returns nothing', async () => {
      const result = await FetchRemoveReviewLicenceService('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).toBeUndefined()
    })
  })
})

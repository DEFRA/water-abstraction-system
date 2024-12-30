'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const { closeConnection } = require('../../../support/database.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Thing under test
const FetchRemoveReviewLicenceService = require('../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js')

describe('Bill Runs Review - Fetch Remove Review Licence service', () => {
  let billRun
  let region
  let reviewLicence

  before(async () => {
    region = RegionHelper.select()

    billRun = await BillRunHelper.add({ batchType: 'two_part_tariff', regionId: region.id, status: 'review' })

    reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id })
  })

  after(async () => {
    await closeConnection()
  })

  describe('when a matching review licence exists', () => {
    it('returns the match', async () => {
      const result = await FetchRemoveReviewLicenceService.go(reviewLicence.id)

      expect(result).to.equal({
        id: reviewLicence.id,
        licenceId: reviewLicence.licenceId,
        licenceRef: reviewLicence.licenceRef,
        billRun: {
          id: billRun.id,
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
      const result = await FetchRemoveReviewLicenceService.go('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).to.be.undefined()
    })
  })
})

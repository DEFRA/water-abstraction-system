'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const FetchReviewLicenceResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-licence-results.service.js')

describe('Fetch Review Licence Results Service', () => {
  let billRun
  let region

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there is a valid bill run', () => {
    beforeEach(async () => {
      region = await RegionHelper.add()
      billRun = await BillRunHelper.add({ regionId: region.id, batchType: 'two_part_tariff' })
    })

    describe('and a valid licence that is included in the bill run', () => {
      it('returns details of the bill run', async () => {
        const result = await FetchReviewLicenceResultsService.go(billRun.id)

        expect(result).to.equal({
          id: billRun.id,
          batchType: billRun.batchType,
          region: {
            id: billRun.regionId,
            displayName: region.displayName
          }
        })
      })
    })
  })

  describe('when there is an invalid bill run id', () => {
    it('returns no results', async () => {
      const result = await FetchReviewLicenceResultsService.go('56db85ed-767f-4c83-8174-5ad9c80fd00d')

      expect(result).to.be.undefined()
    })
  })
})

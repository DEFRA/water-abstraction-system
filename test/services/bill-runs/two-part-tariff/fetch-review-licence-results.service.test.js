'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Thing under test
const FetchReviewLicenceResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-licence-results.service.js')

describe('Fetch Review Licence Results Service', () => {
  let billRun
  let region
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there is a valid bill run', () => {
    beforeEach(async () => {
      region = await RegionHelper.add()
      billRun = await BillRunHelper.add({ regionId: region.id, batchType: 'two_part_tariff' })
    })

    describe('and a valid licence that is included in the bill run', () => {
      let reviewLicence

      beforeEach(async () => {
        licence = await LicenceHelper.add()
        reviewLicence = await ReviewLicenceHelper.add({ licenceId: licence.id })
      })

      it('returns details of the bill run', async () => {
        const result = await FetchReviewLicenceResultsService.go(billRun.id, licence.id)

        expect(result.billRun).to.equal({
          id: billRun.id,
          batchType: billRun.batchType,
          region: {
            id: billRun.regionId,
            displayName: region.displayName
          }
        })
      })

      it('returns the licence ref', async () => {
        const result = await FetchReviewLicenceResultsService.go(billRun.id, licence.id)

        expect(result.licence[0].licenceRef).to.equal(reviewLicence.licenceRef)
      })
    })
  })

  describe('when there is an invalid bill run id', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns no results', async () => {
      const result = await FetchReviewLicenceResultsService.go('56db85ed-767f-4c83-8174-5ad9c80fd00d', licence.id)

      expect(result.billRun).to.be.undefined()
      expect(result.licence).to.have.length(0)
    })
  })
})

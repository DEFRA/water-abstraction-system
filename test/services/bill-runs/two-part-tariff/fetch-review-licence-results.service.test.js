'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewResultHelper = require('../../../support/helpers/review-result.helper.js')
const ReviewReturnResultHelper = require('../../../support/helpers/review-return-result.helper.js')

// Thing under test
const FetchReviewLicenceResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-licence-results.service.js')

describe('Fetch Review Licence Results Service', () => {
  let billRun
  let region
  let licence

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there is a valid bill run', () => {
    beforeEach(async () => {
      region = await RegionHelper.add()
      billRun = await BillRunHelper.add({ regionId: region.id, batchType: 'two_part_tariff' })
    })

    describe('and a valid licence that is included in the bill run', () => {
      let reviewResult
      let reviewReturnResult

      beforeEach(async () => {
        licence = await LicenceHelper.add()
        reviewReturnResult = await ReviewReturnResultHelper.add()
        reviewResult = await ReviewResultHelper.add({ reviewReturnResultId: reviewReturnResult.id, licenceId: licence.id, billRunId: billRun.id })
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

        expect(result.licenceRef).to.equal(licence.licenceRef)
      })

      it('returns details of the licence review results', async () => {
        const result = await FetchReviewLicenceResultsService.go(billRun.id, licence.id)

        expect(result.reviewReturnResults).to.equal([{
          reviewReturnResultId: reviewResult.reviewReturnResultId,
          reviewChargeElementResultId: reviewResult.reviewChargeElementResultId,
          chargeVersionId: reviewResult.chargeVersionId,
          chargePeriodStartDate: reviewResult.chargePeriodStartDate,
          chargePeriodEndDate: reviewResult.chargePeriodEndDate,
          reviewReturnResults: {
            abstractionOutsidePeriod: reviewReturnResult.abstractionOutsidePeriod,
            allocated: reviewReturnResult.allocated,
            description: reviewReturnResult.description,
            dueDate: reviewReturnResult.dueDate,
            endDate: reviewReturnResult.endDate,
            id: reviewReturnResult.id,
            nilReturn: reviewReturnResult.nilReturn,
            purposes: reviewReturnResult.purposes,
            quantity: reviewReturnResult.quantity,
            receivedDate: reviewReturnResult.receivedDate,
            returnId: reviewReturnResult.returnId,
            returnReference: reviewReturnResult.returnReference,
            startDate: reviewReturnResult.startDate,
            status: reviewReturnResult.status,
            underQuery: reviewReturnResult.underQuery
          }
        }])
      })
    })

    describe('and a valid licence but it is not included in the bill run', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add()
      })

      it('returns the bill run but no licence results', async () => {
        const result = await FetchReviewLicenceResultsService.go(billRun.id, licence.id)

        expect(result.billRun.id).to.equal(billRun.id)
        expect(result.reviewReturnResults).to.equal([])
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
      expect(result.reviewReturnResults).to.have.length(0)
    })
  })
})

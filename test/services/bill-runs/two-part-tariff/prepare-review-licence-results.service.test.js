'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PrepareReviewLicenceResultsService = require('../../../../app/services/bill-runs/two-part-tariff/prepare-review-licence-results.service.js')

describe('Prepare Review Licence Results Service', () => {
  describe('when given return logs', () => {
    const returnLogs = _returnLogData()

    describe('to prepares them for the presenter', () => {
      it('deduplicates them and splits them into matched and unmatched returns', async () => {
        const result = await PrepareReviewLicenceResultsService.go(returnLogs)

        expect(result.matchedReturns).to.have.length(2)
        expect(result.matchedReturns).to.equal([returnLogs[0], returnLogs[3]])

        expect(result.unmatchedReturns).to.have.length(1)
        expect(result.unmatchedReturns).to.equal([returnLogs[2]])
      })

      it('works out the charge periods from the return logs', async () => {
        const result = await PrepareReviewLicenceResultsService.go(returnLogs)

        expect(result.chargePeriods).to.equal([
          {
            startDate: new Date('2022-04-01'),
            endDate: new Date('2023-03-31')
          },
          {
            startDate: new Date('2022-07-07'),
            endDate: new Date('2023-05-25')
          }
        ])
      })
    })
  })
})

function _returnLogData () {
  // Data consists of a duplicate return thats matched, an unmatched return and two different charge versions
  return [
    {
      reviewReturnResultId: '90eceec8-18de-4497-8102-3a7c6259d41a',
      reviewChargeElementResultId: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
      chargeVersionId: 'f88dc360-7f7f-4ea2-ad77-f626f7b1e759',
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31')
    },
    {
      reviewReturnResultId: '90eceec8-18de-4497-8102-3a7c6259d41a',
      reviewChargeElementResultId: '550e8400-e29b-41d4-a716-446655440000',
      chargeVersionId: 'f88dc360-7f7f-4ea2-ad77-f626f7b1e759',
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31')
    },
    {
      reviewReturnResultId: '10fgeec8-35de-4497-9502-3a7c6259d41a',
      reviewChargeElementResultId: null,
      chargeVersionId: 'f88dc360-7f7f-4ea2-ad77-f626f7b1e759',
      chargePeriodStartDate: null,
      chargePeriodEndDate: null
    },
    {
      reviewReturnResultId: '89rgsec8-45de-7497-9502-3b7c8259d41a',
      reviewChargeElementResultId: '9f60684c-89fc-48d6-8a12-27dd2beaad36',
      chargeVersionId: '067e6162-3b6f-4ae2-a171-2470b63dff00',
      chargePeriodStartDate: new Date('2022-07-07'),
      chargePeriodEndDate: new Date('2023-05-25')
    }
  ]
}

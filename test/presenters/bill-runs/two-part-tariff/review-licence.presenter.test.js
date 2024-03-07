'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReviewLicencePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

describe('Review Licence presenter', () => {
  describe('when there is data to be presented for the review licence page', () => {
    const billRun = _billRun()
    const licence = [{ licenceRef: '7/34/10/*S/0084' }]

    it('correctly presents the data', async () => {
      const result = ReviewLicencePresenter.go(billRun, licence)

      expect(result).to.equal({
        billRunId: '6620135b-0ecf-4fd4-924e-371f950c0526',
        status: 'review',
        region: 'Anglian',
        licenceRef: '7/34/10/*S/0084'
      })
    })
  })
})

function _billRun () {
  return {
    id: '6620135b-0ecf-4fd4-924e-371f950c0526',
    region: {
      displayName: 'Anglian'
    }
  }
}

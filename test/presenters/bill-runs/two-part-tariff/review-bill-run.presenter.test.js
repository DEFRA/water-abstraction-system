'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

describe.skip('Review Bill Run presenter', () => {
  describe('when there is data to be presented for review', () => {
    let billRun

    beforeEach(async () => {
      // stuff
    })

    describe('and there are licences in the bill run', () => {
      beforeEach(async () => {
        // stuff
      })

      it('returns details of the bill run and the licences in it', async () => {
        const result = await ReviewBillRunPresenter.go()

        expect(result.billRun.id).to.equal(billRun.id)
      })
    })
  })
})

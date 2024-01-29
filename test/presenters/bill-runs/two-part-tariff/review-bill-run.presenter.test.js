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
    let region

    beforeEach(async () => {
      // stuff
    })

    describe('and there are licences in the bill run', () => {
      let testLicence

      beforeEach(async () => {
        // stuff
      })

      it('returns details of the bill run and the licences in it', async () => {
        const result = await ReviewBillRunPresenter.go(id)

        expect(result.billRun.id).to.equal(billRun.id)
        expect(result.billRun.createdAt).to.equal(billRun.createdAt)
        expect(result.billRun.status).to.equal(billRun.status)
        expect(result.billRun.toFinancialYearEnding).to.equal(billRun.toFinancialYearEnding)
        expect(result.billRun.scheme).to.equal(billRun.scheme)
        expect(result.billRun.batchType).to.equal(billRun.batchType)
        expect(result.billRun.region.displayName).to.equal(region.displayName)

        expect(result.billRunLicences).to.have.length(1)
        expect(result.billRunLicences[0].licenceId).to.equal(testLicence.id)
        expect(result.billRunLicences[0].licenceHolder).to.equal('Licence Holder Ltd')
        expect(result.billRunLicences[0].licenceRef).to.equal(testLicence.licenceRef)
      })
    })
  })
})

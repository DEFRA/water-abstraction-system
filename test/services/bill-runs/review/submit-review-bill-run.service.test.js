'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Thing under test
const SubmitReviewBillRunService = require('../../../../app/services/bill-runs/review/submit-review-bill-run.service.js')

describe('Bill Runs Review - Submit Review Bill Run Service', () => {
  const billRunId = '27dad88a-6b3c-438b-a25f-f1483e7e12a0'
  let yarStub

  beforeEach(() => {
    yarStub = { clear: Sinon.stub().returns(), set: Sinon.stub().returns() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with the filters applied', () => {
    const payload = {
      filterIssues: ['abs-outside-period', 'aggregate-factor'],
      filterLicenceHolderNumber: 'A Licence Holder Ltd',
      filterLicenceStatus: 'review',
      filterProgress: true
    }

    it('will set the cookie with the filter data', async () => {
      await SubmitReviewBillRunService.go(billRunId, payload, yarStub)

      expect(yarStub.clear.called).to.be.false()
      expect(yarStub.set.called).to.be.true()
      expect(yarStub.set.args[0][0]).to.equal('review-27dad88a-6b3c-438b-a25f-f1483e7e12a0')
      expect(yarStub.set.args[0][1]).to.equal(payload)
    })
  })

  describe('when called to clear the filters', () => {
    const payload = { clearFilters: 'reset' }

    it('will clear the filter data from the cookie', async () => {
      await SubmitReviewBillRunService.go(billRunId, payload, yarStub)

      expect(yarStub.clear.called).to.be.true()
      expect(yarStub.clear.args[0][0]).to.equal('review-27dad88a-6b3c-438b-a25f-f1483e7e12a0')
      expect(yarStub.set.called).to.be.false()
    })
  })
})

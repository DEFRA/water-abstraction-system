'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const SubmitReviewService = require('../../../../app/services/bill-runs/review/submit-review.service.js')

describe('Bill Runs - Review - Submit Review Service', () => {
  const billRunId = generateUUID()

  let payload
  let yarStub

  beforeEach(() => {
    yarStub = { clear: Sinon.stub().returns(), set: Sinon.stub().returns() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('clears the filter object from the session', async () => {
        await SubmitReviewService.go(billRunId, payload, yarStub)

        expect(yarStub.clear.called).to.be.true()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('saves a default filter object in the session', async () => {
        await SubmitReviewService.go(billRunId, payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal(`review-${billRunId}`)
        expect(setArgs[1]).to.equal({
          issues: [],
          licenceHolderNumber: null,
          licenceStatus: null,
          progress: []
        })
      })
    })

    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          issues: ['abs-outside-period', 'aggregate-factor'],
          licenceHolderNumber: 'A Licence Holder Ltd',
          licenceStatus: 'review',
          progress: ['inProgress']
        }
      })

      it('saves the submitted filters as the "usersFilter" object in the session', async () => {
        await SubmitReviewService.go(billRunId, payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal(`review-${billRunId}`)
        expect(setArgs[1]).to.equal({
          issues: ['abs-outside-period', 'aggregate-factor'],
          licenceHolderNumber: 'A Licence Holder Ltd',
          licenceStatus: 'review',
          progress: ['inProgress']
        })
      })
    })
  })
})

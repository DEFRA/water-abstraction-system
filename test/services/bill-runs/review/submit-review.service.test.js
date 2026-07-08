'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const YarStub = require('../../../support/stubs/yar.stub.js')

// Thing under test
const SubmitReviewService = require('../../../../app/services/bill-runs/review/submit-review.service.js')

describe('Bill Runs - Review - Submit Review Service', () => {
  const billRunId = generateUUID()

  let payload
  let yarStub

  beforeEach(() => {
    yarStub = YarStub.build(Sinon)
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
        await SubmitReviewService(billRunId, payload, yarStub)

        expect(yarStub.clear.called).toBe(true)
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('saves a default filter object in the session', async () => {
        await SubmitReviewService(billRunId, payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).toEqual(`review-${billRunId}`)
        expect(setArgs[1]).toEqual({
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
        await SubmitReviewService(billRunId, payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).toEqual(`review-${billRunId}`)
        expect(setArgs[1]).toEqual({
          issues: ['abs-outside-period', 'aggregate-factor'],
          licenceHolderNumber: 'A Licence Holder Ltd',
          licenceStatus: 'review',
          progress: ['inProgress']
        })
      })
    })
  })
})

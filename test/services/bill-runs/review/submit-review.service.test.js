// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Thing under test
import SubmitReviewService from '../../../../app/services/bill-runs/review/submit-review.service.js'

describe('Bill Runs - Review - Submit Review Service', () => {
  const billRunId = generateUUID()

  let payload
  let yarStub

  beforeEach(() => {
    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

        expect(yarStub.clear).toHaveBeenCalled()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('saves a default filter object in the session', async () => {
        await SubmitReviewService(billRunId, payload, yarStub)

        const setArgs = yarStub.set.mock.calls[0]

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

        const setArgs = yarStub.set.mock.calls[0]

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

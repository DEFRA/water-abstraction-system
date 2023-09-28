'use strict'
/* global describe beforeEach test expect */

const ExpandedError = require('../../app/errors/expanded.error.js')
describe('ExpandedError', () => {
  describe('when instantiated with additional data properties', () => {
    let additionalData

    beforeEach(() => {
      additionalData = {
        billRunId: '37f2871b-e0a7-471f-902b-1e55b09d6d88',
        details: {
          type: 'supplementary',
          status: 'errored'
        }
      }
    })

    test('will assign those to the error instance', () => {
      const result = new ExpandedError('My test error', additionalData)

      expect(result.message).toEqual('My test error')
      expect(result.billRunId).toEqual(additionalData.billRunId)
      expect(result.details).toEqual(additionalData.details)
    })
  })
})

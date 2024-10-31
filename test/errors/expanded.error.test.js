'use strict'

// Test framework dependencies
const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')

const { expect } = Code

// Thing under test
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

    it('will assign those to the error instance', () => {
      const result = new ExpandedError('My test error', additionalData)

      expect(result.message).to.equal('My test error')
      expect(result.billRunId).to.equal(additionalData.billRunId)
      expect(result.details).to.equal(additionalData.details)
    })
  })
})

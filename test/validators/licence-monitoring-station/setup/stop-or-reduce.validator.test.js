'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StopOrReduceValidator = require('../../../../app/validators/licence-monitoring-station/setup/stop-or-reduce.validator.js')

describe('Stop Or Reduce Validator', () => {
  let payload

  beforeEach(() => {
    payload = {}
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = StopOrReduceValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    it('returns with errors', () => {
      const result = StopOrReduceValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('')
    })
  })
})

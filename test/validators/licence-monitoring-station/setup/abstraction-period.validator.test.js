'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AbstractionPeriodValidator = require('../../../../app/validators/licence-monitoring-station/setup/abstraction-period.validator.js')

describe('Abstraction Period Validator', () => {
  let payload

  beforeEach(() => {
    payload = { placeholder: '' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = AbstractionPeriodValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('"placeholder" is required')
    })
  })
})

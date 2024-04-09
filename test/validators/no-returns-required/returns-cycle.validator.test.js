'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReturnsCycleValidator = require('../../../app/validators/return-requirements/returns-cycle.validator.js')

describe('Returns Cycle validator', () => {
  describe('when valid data is provided', () => {
    const payload = {
      returnsCycle: 'winter-and-all-year'
    }

    it('confirms the data is valid', async () => {
      const result = ReturnsCycleValidator.go(payload)

      expect(result.value.returnsCycle).to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const payload = {
      returnsCycle: 'ABC123'
    }

    it('fails validation', () => {
      const result = ReturnsCycleValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select the returns cycle for the return requirement')
    })
  })

  describe('when no data is provided', () => {
    const payload = {}

    it('fails validation', () => {
      const result = ReturnsCycleValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select the returns cycle for the return requirement')
    })
  })
})

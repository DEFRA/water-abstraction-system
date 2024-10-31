'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const ReturnsCycleValidator = require('../../../../app/validators/return-versions/setup/returns-cycle.validator.js')

describe('Return Versions Setup - Returns Cycle validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        returnsCycle: 'winter-and-all-year'
      }
    })

    it('confirms the data is valid', async () => {
      const result = ReturnsCycleValidator.go(payload)

      expect(result.value.returnsCycle).to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {
        returnsCycle: 'ABC123'
      }
    })

    it('fails validation', () => {
      const result = ReturnsCycleValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select the returns cycle for the requirements for returns')
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = ReturnsCycleValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select the returns cycle for the requirements for returns')
    })
  })
})

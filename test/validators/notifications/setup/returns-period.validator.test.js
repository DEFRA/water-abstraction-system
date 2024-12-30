'use strict'

// Test framework dependencies
const { describe, it } = require('node:test')
const { expect } = require('@hapi/code')

// Thing under test
const ReturnsPeriodValidator = require('../../../../app/validators/notifications/setup/returns-periods.validator.js')

describe('Notifications Setup - Returns Period validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = ReturnsPeriodValidator.go({ returnsPeriod: 'summer' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "returnsPeriod" is given', () => {
      it('fails validation', () => {
        const result = ReturnsPeriodValidator.go({ returnsPeriod: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the returns periods for the invitations')
      })
    })

    describe('because an unknown "returnsPeriod" is given', () => {
      it('fails validation', () => {
        const result = ReturnsPeriodValidator.go({ returnsPeriod: 'just-because' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the returns periods for the invitations')
      })
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StartValidator = require('../../../../app/validators/return-logs/setup/start.validator.js')

describe('Return Logs Setup - Start validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = StartValidator.go({ journey: 'enter-return' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "journey" is given', () => {
      it('fails validation', () => {
        const result = StartValidator.go({ journey: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select what you want to do with this return')
      })
    })

    describe('because an unknown "type" is given', () => {
      it('fails validation', () => {
        const result = StartValidator.go({ journey: 'invalid' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select what you want to do with this return')
      })
    })
  })
})

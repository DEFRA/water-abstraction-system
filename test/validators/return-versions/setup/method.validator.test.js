'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const MethodValidator = require('../../../../app/validators/return-versions/setup/method.validator.js')

describe('Return Versions Setup - Method validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = MethodValidator.go({ method: 'useAbstractionData' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "method" is given', () => {
      it('fails validation', () => {
        const result = MethodValidator.go({ method: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select how you want to set up the requirements for returns')
      })
    })

    describe('because an unknown "method" is given', () => {
      it('fails validation', () => {
        const result = MethodValidator.go({ method: 'just-because' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select how you want to set up the requirements for returns')
      })
    })
  })
})

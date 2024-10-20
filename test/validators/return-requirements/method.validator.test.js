'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const MethodValidator = require('../../../app/validators/return-requirements/method.validator.js')

describe('Method validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = MethodValidator.go({ setup: 'use-abstraction-data' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when valid data is provided', () => {
    describe('because no "setup" is given', () => {
      it('fails validation', () => {
        const result = MethodValidator.go({ setup: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select how you want to set up the requirements for returns')
      })
    })

    describe('because an unknown "setup" is given', () => {
      it('fails validation', () => {
        const result = MethodValidator.go({ setup: 'just-because' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select how you want to set up the requirements for returns')
      })
    })
  })
})

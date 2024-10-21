'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReasonValidator = require('../../../../app/validators/return-requirements/setup/reason.validator.js')

describe('Return Requirements Setup - Reason validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = ReasonValidator.go({ reason: 'new-licence' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when valid data is provided', () => {
    describe('because no "reason" is given', () => {
      it('fails validation', () => {
        const result = ReasonValidator.go({ reason: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the reason for the requirements for returns')
      })
    })

    describe('because an unknown "reason" is given', () => {
      it('fails validation', () => {
        const result = ReasonValidator.go({ reason: 'just-because' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the reason for the requirements for returns')
      })
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SetupValidator = require('../../../app/validators/return-requirements/setup.validator.js')

describe('Setup validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = SetupValidator.go({ setup: 'use_abstraction_data' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when valid data is provided', () => {
    describe("because no 'setup' is given", () => {
      it('fails validation', () => {
        const result = SetupValidator.go({ setup: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select how you want to set up the return requirement')
      })
    })

    describe("because an unknown 'setup' is given", () => {
      it('fails validation', () => {
        const result = SetupValidator.go({ setup: 'just-because' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select how you want to set up the return requirement')
      })
    })
  })
})

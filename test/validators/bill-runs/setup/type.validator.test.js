'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const TypeValidator = require('../../../../app/validators/bill-runs/setup/type.validator.js')

describe('Bill Runs Setup Type validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = TypeValidator.go({ type: 'annual' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "type" is given', () => {
      it('fails validation', () => {
        const result = TypeValidator.go({ type: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select a bill run type')
      })
    })

    describe('because an unknown "type" is given', () => {
      it('fails validation', () => {
        const result = TypeValidator.go({ type: 'free_one' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select a bill run type')
      })
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemoveLicencesValidator = require('../../../../app/validators/notifications/setup/remove-licences.validator.js')

describe('Notifications Setup - Remove licences validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = RemoveLicencesValidator.go({ removeLicences: '123/67' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "removeLicences" is given', () => {
      it('fails validation', () => {
        const result = RemoveLicencesValidator.go({ removeLicences: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Please enter a licence number')
      })
    })
  })
})

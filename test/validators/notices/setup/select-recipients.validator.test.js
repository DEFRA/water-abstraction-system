'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SelectRecipientsValidator = require('../../../../app/validators/notices/setup/select-recipients.validator.js')

describe('Select Recipients Validator', () => {
  let payload

  beforeEach(() => {
    payload = { recipients: ['123'] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = SelectRecipientsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('when the payload is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = SelectRecipientsValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select at least one recipient')
      })
    })

    describe('when the array is empty', () => {
      beforeEach(() => {
        payload = { recipients: [] }
      })

      it('returns with errors', () => {
        const result = SelectRecipientsValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select at least one recipient')
      })
    })
  })
})

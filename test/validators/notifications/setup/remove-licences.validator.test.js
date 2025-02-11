'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemoveLicencesValidator = require('../../../../app/validators/notifications/setup/remove-licences.validator.js')

describe('Notifications Setup - Remove licences validator', () => {
  let validLicences
  let payload

  beforeEach(() => {
    payload = { removeLicences: '123/67' }
    validLicences = [{ licenceRef: '123/67' }]
  })

  describe('when licences are valid', () => {
    it('confirms the data is valid', () => {
      const result = RemoveLicencesValidator.go(payload, validLicences)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because the licence is not a valid licence', () => {
      beforeEach(() => {
        validLicences = ['']
      })

      it('fails validation', () => {
        const result = RemoveLicencesValidator.go(payload, validLicences)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('There are no returns due for licence 123/67')
      })
    })

    describe('because multiple licences are not valid licences', () => {
      beforeEach(() => {
        payload = { removeLicences: '123/67, 678' }
        validLicences = ['']
      })

      it('fails validation', () => {
        const result = RemoveLicencesValidator.go(payload, validLicences)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('There are no returns due for licences 123/67, 678')
      })
    })
  })
})

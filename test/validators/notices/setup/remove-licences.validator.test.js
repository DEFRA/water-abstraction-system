'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemoveLicencesValidator = require('../../../../app/validators/notices/setup/remove-licences.validator.js')

describe('Notices - Setup - Remove licences validator', () => {
  let validLicences
  let payload

  beforeEach(() => {
    validLicences = [{ licenceRef: '123/67' }]
  })

  describe('when licences are valid to be removed', () => {
    beforeEach(() => {
      payload = { removeLicences: '123/67' }
    })

    it('confirms the data is valid', () => {
      const result = RemoveLicencesValidator.go(payload, validLicences)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because a licence is not a valid licence to be removed', () => {
      beforeEach(() => {
        payload = { removeLicences: '01/123' }
      })

      it('fails validation', () => {
        const result = RemoveLicencesValidator.go(payload, validLicences)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('There are no returns due for licence 01/123')
      })
    })

    describe('because multiple licences are not valid licences to be removed', () => {
      beforeEach(() => {
        payload = { removeLicences: '01/123,678' }
      })

      it('fails validation', () => {
        const result = RemoveLicencesValidator.go(payload, validLicences)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('There are no returns due for licences 01/123, 678')
      })
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AdHocLicenceValidator = require('../../../../app/validators/notifications/setup/ad-hoc-licence.validator.js')

describe('Notifications Setup - Ad Hoc licence validator', () => {
  let licenceExists
  let payload

  beforeEach(() => {
    licenceExists = true
    payload = { licenceRef: '123/67' }
  })

  it('confirms the data is valid', () => {
    const result = AdHocLicenceValidator.go(payload, licenceExists)

    expect(result.value).to.exist()
    expect(result.error).not.to.exist()
  })

  describe('when invalid data is provided', () => {
    describe('because a "licenceRef" has not been provided', () => {
      beforeEach(() => {
        licenceExists = false
        payload = { licenceRef: '' }
      })

      it('confirms the data is invalid', () => {
        const result = AdHocLicenceValidator.go(payload, licenceExists)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a licence number')
      })
    })

    describe('because the "licenceRef" does not exist', () => {
      beforeEach(() => {
        licenceExists = false
      })

      it('confirms the data is invalid', () => {
        const result = AdHocLicenceValidator.go(payload, licenceExists)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid licence number')
      })
    })
  })
})

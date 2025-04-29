'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AdHocLicenceValidator = require('../../../../app/validators/notices/setup/ad-hoc-licence.validator.js')

describe('Notices - Setup - Ad Hoc licence validator', () => {
  let dueReturns
  let licenceExists
  let payload

  beforeEach(() => {
    dueReturns = true
    licenceExists = true
    payload = { licenceRef: '123/67' }
  })

  it('confirms the data is valid', () => {
    const result = AdHocLicenceValidator.go(payload, licenceExists, dueReturns)

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
        const result = AdHocLicenceValidator.go(payload, licenceExists, dueReturns)

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
        const result = AdHocLicenceValidator.go(payload, licenceExists, dueReturns)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid licence number')
      })
    })

    describe('because the "licenceRef" does not have any returns due', () => {
      beforeEach(() => {
        dueReturns = false
      })

      it('confirms the data is invalid', () => {
        const result = AdHocLicenceValidator.go(payload, licenceExists, dueReturns)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('There are no returns due for licence 123/67')
      })
    })
  })
})

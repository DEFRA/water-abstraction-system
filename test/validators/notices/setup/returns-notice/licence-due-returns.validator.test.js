'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceDueReturnsValidator = require('../../../../../app/validators/notices/setup/returns-notice/licence-due-returns.validator.js')

describe('Notices - Setup - Returns Notice - licence due returns validator', () => {
  let dueReturnsExist
  let licenceExists
  let payload

  beforeEach(() => {
    dueReturnsExist = true
    licenceExists = true
    payload = { licenceRef: '123/67' }
  })

  it('confirms the data is valid', () => {
    const result = LicenceDueReturnsValidator.go(payload, licenceExists, dueReturnsExist)

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
        const result = LicenceDueReturnsValidator.go(payload, licenceExists, dueReturnsExist)

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
        const result = LicenceDueReturnsValidator.go(payload, licenceExists, dueReturnsExist)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid licence number')
      })
    })

    describe('because the "licenceRef" does not have any returns due', () => {
      beforeEach(() => {
        dueReturnsExist = false
      })

      it('confirms the data is invalid', () => {
        const result = LicenceDueReturnsValidator.go(payload, licenceExists, dueReturnsExist)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('There are no returns due for licence 123/67')
      })
    })
  })
})

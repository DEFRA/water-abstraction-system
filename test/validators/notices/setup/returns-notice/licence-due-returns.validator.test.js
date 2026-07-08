'use strict'

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
    const result = LicenceDueReturnsValidator(payload, licenceExists, dueReturnsExist)

    expect(result.value).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  describe('when invalid data is provided', () => {
    describe('because a "licenceRef" has not been provided', () => {
      beforeEach(() => {
        licenceExists = false
        payload = { licenceRef: '' }
      })

      it('confirms the data is invalid', () => {
        const result = LicenceDueReturnsValidator(payload, licenceExists, dueReturnsExist)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a licence number')
      })
    })

    describe('because the "licenceRef" does not exist', () => {
      beforeEach(() => {
        licenceExists = false
      })

      it('confirms the data is invalid', () => {
        const result = LicenceDueReturnsValidator(payload, licenceExists, dueReturnsExist)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a valid licence number')
      })
    })

    describe('because the "licenceRef" does not have any returns due', () => {
      beforeEach(() => {
        dueReturnsExist = false
      })

      it('confirms the data is invalid', () => {
        const result = LicenceDueReturnsValidator(payload, licenceExists, dueReturnsExist)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('There are no returns due for licence 123/67')
      })
    })
  })
})

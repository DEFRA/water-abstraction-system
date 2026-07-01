'use strict'

// Thing under test
const AgreementsExceptionsValidator = require('../../../../app/validators/return-versions/setup/agreements-exceptions.validator.js')

describe('Return Versions Setup - Agreements Exception validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        agreementsExceptions: ['gravity-fill', 'two-part-tariff', '56-returns-exception']
      }
    })

    it('confirms the data is valid', () => {
      const result = AgreementsExceptionsValidator.go(payload)

      expect(result.value.agreementsExceptions).toEqual(['gravity-fill', 'two-part-tariff', '56-returns-exception'])

      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {
        agreementsExceptions: ['ABC123']
      }
    })

    it('fails validation', () => {
      const result = AgreementsExceptionsValidator.go(payload)

      expect(result.error.details[0].message).toEqual(
        'Select if there are any agreements and exceptions needed for the requirements for returns'
      )
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = { agreementsExceptions: [] }
    })

    it('fails validation', () => {
      const result = AgreementsExceptionsValidator.go(payload)

      expect(result.error.details[0].message).toEqual(
        'Select if there are any agreements and exceptions needed for the requirements for returns'
      )
    })
  })
})

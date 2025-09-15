'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AgreementsExceptionsValidator = require('../../../../app/validators/return-versions/setup/agreements-exceptions.validator.js')

describe('Return Versions Setup - Agreements Exception validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        'agreements-exceptions': ['gravity-fill', 'two-part-tariff', '56-returns-exception']
      }
    })

    it('confirms the data is valid', () => {
      const result = AgreementsExceptionsValidator.go(payload)

      expect(result.value['agreements-exceptions']).to.equal([
        'gravity-fill',
        'two-part-tariff',
        '56-returns-exception'
      ])

      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {
        'agreements-exceptions': ['ABC123']
      }
    })

    it('fails validation', () => {
      const result = AgreementsExceptionsValidator.go(payload)

      expect(result.error.details[0].message).to.equal(
        'Select if there are any agreements and exceptions needed for the requirements for returns'
      )
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = AgreementsExceptionsValidator.go(payload)

      expect(result.error.details[0].message).to.equal(
        'Select if there are any agreements and exceptions needed for the requirements for returns'
      )
    })
  })
})

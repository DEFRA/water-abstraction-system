'use strict'

// Thing under test
const AbstractionAlertsValidator = require('../../../../app/validators/company-contacts/setup/abstraction-alerts.validator.js')

describe('Company Contacts - Setup - Abstraction Alerts Validator', () => {
  let payload

  beforeEach(() => {
    payload = { abstractionAlerts: 'yes' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AbstractionAlertsValidator.go(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('when no option has been selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = AbstractionAlertsValidator.go(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Should the contact get water abstraction alerts')
      })
    })
  })
})

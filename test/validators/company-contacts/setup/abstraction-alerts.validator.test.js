'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = AbstractionAlertsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('"abstractionAlerts" is required')
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const FrequencyReportedValidator = require('../../../app/validators/return-requirements/frequency-reported.validator.js')

describe('Frequency reported validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        frequencyReported: 'monthly'
      }
    })

    it('confirms the data is valid', async () => {
      const result = FrequencyReportedValidator.go(payload)

      expect(result.value.frequencyReported).to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {
        frequencyReported: 'ABC123'
      }
    })

    it('fails validation', () => {
      const result = FrequencyReportedValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select how often readings or volumes are reported')
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = FrequencyReportedValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select how often readings or volumes are reported')
    })
  })
})

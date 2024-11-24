'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const FrequencyCollectedValidator = require('../../../../app/validators/return-versions/setup/frequency-collected.validator.js')

describe('Return Versions Setup - Frequency Collected validator', () => {
  let payload

  describe('when valid data is provided', () => {
    beforeEach(() => {
      payload = {
        frequencyCollected: 'month'
      }
    })

    it('confirms the data is valid', async () => {
      const result = FrequencyCollectedValidator.go(payload)

      expect(result.error).not.to.exist()
      expect(result.value.frequencyCollected).to.equal('month')
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {
        frequencyCollected: 'ABC123'
      }
    })

    it('fails validation', () => {
      const result = FrequencyCollectedValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select how often readings or volumes are collected')
    })
  })

  describe('when no data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    it('fails validation', () => {
      const result = FrequencyCollectedValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select how often readings or volumes are collected')
    })
  })
})

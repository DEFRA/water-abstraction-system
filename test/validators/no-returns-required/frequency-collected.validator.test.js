'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const FrequencyCollectedValidator = require('../../../app/validators/return-requirements/frequency-collected.validator.js')

describe('Frequency Collected validator', () => {
  describe('when valid data is provided', () => {
    const payload = {
      frequencyCollected: 'monthly'
    }

    it('confirms the data is valid', async () => {
      const result = FrequencyCollectedValidator.go(payload)

      expect(result.value.frequencyCollected).to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const payload = {
      frequencyCollected: 'ABC123'
    }

    it('fails validation', () => {
      const result = FrequencyCollectedValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select how often readings or volumes are collected')
    })
  })

  describe('when no data is provided', () => {
    const payload = {}

    it('fails validation', () => {
      const result = FrequencyCollectedValidator.go(payload)

      expect(result.error.details[0].message).to.equal('Select how often readings or volumes are collected')
    })
  })
})

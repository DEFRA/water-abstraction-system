'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PurposeValidator = require('../../../app/validators/return-requirements/purpose.validator.js')

describe.only('Purpose validator', () => {
  let payload
  describe('when valid data is provided', () => {
    payload = {
      purposes: [
        'Heat Pump',
        'Horticultural Watering',
        'Hydraulic Rams',
        'Hydraulic Testing',
        'Hydroelectric Power Generation'
      ]
    }

    it('confirms the data is valid', () => {
      const result = PurposeValidator.go(payload)
      console.log('🚀🚀🚀 ~ result:', result)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    payload = {
      purposes: [
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose'
      ]
    }

    it('fails validation', () => {
      const result = PurposeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select any uses for the return requirement')
    })
  })

  describe('when no data is provided', () => {
    payload = {}

    it('fails validation', () => {
      const result = PurposeValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select any uses for the return requirement')
    })
  })
})

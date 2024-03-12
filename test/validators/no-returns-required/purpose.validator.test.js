'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PurposeValidator = require('../../../app/validators/return-requirements/purpose.validator.js')

describe.only('Purpose validator', () => {
  const purposes = [
    'Heat Pump',
    'Horticultural Watering',
    'Hydraulic Rams',
    'Hydraulic Testing',
    'Hydroelectric Power Generation'
  ]
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = PurposeValidator.go(purposes)
      console.log('🚀🚀🚀 ~ result:', result)
    })
  })
})

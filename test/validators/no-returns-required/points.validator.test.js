'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PointsValidator = require('../../../app/validators/return-requirements/points.validator.js')

describe('Point validator', () => {
  describe('when valid data is provided', () => {
    const payload = {
      points: [
        'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)',
        'At National Grid Reference TQ 68083 33604 (BEWL WATER RESERVOIR)'
      ]
    }

    it('confirms the data is valid', () => {
      const result = PointsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const payload = {
      purposes: [
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose',
        'Invalid purpose'
      ]
    }

    it('fails validation', () => {
      const result = PointsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select any points for the return requirement')
    })
  })

  describe('when no data is provided', () => {
    const payload = {}

    it('fails validation', () => {
      const result = PointsValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Select any points for the return requirement')
    })
  })
})

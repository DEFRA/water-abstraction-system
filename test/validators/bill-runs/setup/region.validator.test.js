'use strict'

// Test framework dependencies
const { describe, it } = require('node:test')
const { expect } = require('@hapi/code')

// Thing under test
const RegionValidator = require('../../../../app/validators/bill-runs/setup/region.validator.js')

describe('Bill Runs Setup Region validator', () => {
  const regions = [
    { id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' },
    { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' },
    { id: '3334054e-03b6-4696-9d74-62b8b76a3c64', displayName: 'Westerlands' }
  ]

  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = RegionValidator.go({ region: '19a027c6-4aad-47d3-80e3-3917a4579a5b' }, regions)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "region" is given', () => {
      it('fails validation', () => {
        const result = RegionValidator.go({ region: '' }, regions)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the region')
      })
    })

    describe('because an unknown "region" is given', () => {
      it('fails validation', () => {
        const result = RegionValidator.go({ region: '34b43f8a-aee4-48e0-ab17-f819ac2c9a15' }, regions)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the region')
      })
    })
  })
})

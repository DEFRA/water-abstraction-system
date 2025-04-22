'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckValidator = require('../../../../../app/validators/return-versions/setup/check/check.validator.js')

describe('Check validator', () => {
  let requirements

  before(() => {
    requirements = testRequirements()
  })

  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = CheckValidator.go(requirements)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    before(() => {
      requirements[0].returnsCycle = 'summer'
    })

    it('it fails validation', () => {
      const result = CheckValidator.go(requirements)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal(
        "Quarterly returns submissions can't be set for returns in the summer cycle"
      )
    })
  })
})

function testRequirements() {
  return [
    {
      points: ['9a1a0916-f45e-4e86-ab7a-8d9c773699b3'],
      purposes: [],
      returnsCycle: 'winter-and-all-year',
      siteDescription: 'Addington Sandpits',
      abstractionPeriod: {
        'end-abstraction-period-day': 31,
        'end-abstraction-period-month': 12,
        'start-abstraction-period-day': 1,
        'start-abstraction-period-month': 1
      },
      frequencyReported: 'month',
      frequencyCollected: 'month',
      agreementsExceptions: ['none']
    },
    {
      points: ['0f3da7ba-86d1-4360-8705-c7d85e2f6549'],
      purposes: [],
      returnsCycle: 'winter-and-all-year',
      siteDescription: 'Addington Sandpits',
      abstractionPeriod: {
        'end-abstraction-period-day': 27,
        'end-abstraction-period-month': 1,
        'start-abstraction-period-day': 1,
        'start-abstraction-period-month': 12
      },
      frequencyReported: 'week',
      frequencyCollected: 'week',
      agreementsExceptions: ['none']
    }
  ]
}

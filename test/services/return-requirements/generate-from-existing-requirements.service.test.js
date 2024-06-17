'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const RequirementsForReturnsSeed = require('../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const GenerateFromExistingRequirementsService = require('../../../app/services/return-requirements/generate-from-existing-requirements.service.js')

describe('Return Requirements - Generate From Existing Requirements service', () => {
  let returnVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when a matching return version exists', () => {
    beforeEach(async () => {
      returnVersion = await RequirementsForReturnsSeed.seed()
    })

    it('returns the details of the its return requirements transformed for use in the journey', async () => {
      const result = await GenerateFromExistingRequirementsService.go(returnVersion.id)

      expect(result).to.equal([
        {
          points: ['1234'],
          purposes: ['1a1a68cc-b1f5-43db-8d1a-3452425bcc68'],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'FIRST BOREHOLE AT AVALON',
          abstractionPeriod: {
            'end-abstraction-period-day': 31,
            'end-abstraction-period-month': 3,
            'start-abstraction-period-day': 1,
            'start-abstraction-period-month': 4
          },
          frequencyReported: 'weekly',
          frequencyCollected: 'weekly',
          agreementsExceptions: ['none']
        },
        {
          points: ['4321'],
          purposes: ['91bac151-1c95-4ae5-b0bb-490980396e24'],
          returnsCycle: 'summer',
          siteDescription: 'SECOND BOREHOLE AT AVALON',
          abstractionPeriod: {
            'end-abstraction-period-day': 31,
            'end-abstraction-period-month': 3,
            'start-abstraction-period-day': 1,
            'start-abstraction-period-month': 4
          },
          frequencyReported: 'monthly',
          frequencyCollected: 'weekly',
          agreementsExceptions: [
            '56-returns-exception',
            'gravity-fill',
            'transfer-re-abstraction-scheme',
            'two-part-tariff'
          ]
        }
      ])
    })
  })
})

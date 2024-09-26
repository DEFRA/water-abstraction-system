'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const RequirementsForReturnsSeed = require('../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const GenerateFromExistingRequirementsService = require('../../../app/services/return-requirements/generate-from-existing-requirements.service.js')

describe('Return Requirements - Generate From Existing Requirements service', () => {
  let returnVersion

  describe('when a matching return version exists', () => {
    beforeEach(async () => {
      const seedData = await RequirementsForReturnsSeed.seed()

      returnVersion = seedData.returnVersion
    })

    it('returns the details of the its return requirements transformed for use in the journey', async () => {
      const result = await GenerateFromExistingRequirementsService.go(returnVersion.id)

      expect(result).to.equal([
        {
          points: [returnVersion.returnRequirements[0].points[0].id],
          purposes: [{
            alias: returnVersion.returnRequirements[0].returnRequirementPurposes[0].alias,
            description: 'Spray Irrigation - Storage',
            id: returnVersion.returnRequirements[0].returnRequirementPurposes[0].purposeId
          }],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'FIRST BOREHOLE AT AVALON',
          abstractionPeriod: {
            'end-abstraction-period-day': 31,
            'end-abstraction-period-month': 3,
            'start-abstraction-period-day': 1,
            'start-abstraction-period-month': 4
          },
          frequencyReported: 'week',
          frequencyCollected: 'week',
          agreementsExceptions: ['none']
        },
        {
          points: [returnVersion.returnRequirements[1].points[0].id],
          purposes: [{
            alias: '',
            description: 'Spray Irrigation - Storage',
            id: returnVersion.returnRequirements[1].returnRequirementPurposes[0].purposeId
          }],
          returnsCycle: 'summer',
          siteDescription: 'SECOND BOREHOLE AT AVALON',
          abstractionPeriod: {
            'end-abstraction-period-day': 31,
            'end-abstraction-period-month': 3,
            'start-abstraction-period-day': 1,
            'start-abstraction-period-month': 4
          },
          frequencyReported: 'month',
          frequencyCollected: 'week',
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

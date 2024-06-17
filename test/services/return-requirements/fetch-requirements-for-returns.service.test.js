'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const RequirementsForReturnsSeeder = require('../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const FetchRequirementsForReturnsService = require('../../../app/services/return-requirements/fetch-requirements-for-returns.service.js')

describe('Return Requirements - Fetch Requirements for returns service', () => {
  let returnVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when a matching return version exists', () => {
    beforeEach(async () => {
      returnVersion = await RequirementsForReturnsSeeder.seed()
    })

    it('returns the details of the requirements for returns transformed for use in the view page', async () => {
      const result = await FetchRequirementsForReturnsService.go(returnVersion.id)

      expect(result).to.equal({
        id: result.id,
        licence: {
          id: result.licence.id,
          licenceDocument: null
        },
        reason: 'new-licence',
        returnRequirements: [
          {
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 3,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 4
            },
            agreementsExceptions: [
              'none'
            ],
            frequencyCollected: 'weekly',
            frequencyReported: 'weekly',
            legacyId: result.returnRequirements[0].legacyId,
            points: [
              '1234'
            ],
            purposes: [
              'Spray Irrigation - Storage'
            ],
            returnsCycle: 'winter-and-all-year',
            siteDescription: 'FIRST BOREHOLE AT AVALON'
          },
          {
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 3,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 4
            },
            agreementsExceptions: [
              '56-returns-exception',
              'gravity-fill',
              'transfer-re-abstraction-scheme',
              'two-part-tariff'
            ],
            frequencyCollected: 'weekly',
            frequencyReported: 'monthly',
            legacyId: result.returnRequirements[1].legacyId,
            points: [
              '4321'
            ],
            purposes: [
              'Spray Irrigation - Storage'
            ],
            returnsCycle: 'summer',
            siteDescription: 'SECOND BOREHOLE AT AVALON'
          }
        ],
        startDate: new Date('2022-04-01'),
        status: 'current'
      }
      )
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const RequirementsForReturnsSeeder = require('../../../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const FetchExistingRequirementsService = require('../../../../../app/services/return-versions/setup/existing/fetch-existing-requirements.service.js')

describe('Return Versions Setup - Fetch Existing Requirements service', () => {
  let returnVersion

  describe('when a matching return version exists', () => {
    before(async () => {
      const seedData = await RequirementsForReturnsSeeder.seed()

      returnVersion = seedData.returnVersion
    })

    it('returns the details of the requirements for returns', async () => {
      const result = await FetchExistingRequirementsService.go(returnVersion.id)

      const [returnRequirementsOne, returnRequirementsTwo] = result.returnRequirements

      expect(result).to.equal({
        id: returnVersion.id,
        returnRequirements: [
          {
            id: returnRequirementsTwo.id,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            collectionFrequency: 'week',
            fiftySixException: true,
            gravityFill: true,
            reabstraction: true,
            reportingFrequency: 'month',
            siteDescription: 'SUMMER BOREHOLE AT AVALON',
            summer: true,
            twoPartTariff: true,
            points: [
              {
                id: returnRequirementsTwo.points[0].id,
                description: 'WELL AT WELLINGTON'
              }
            ],
            returnRequirementPurposes: [
              {
                id: returnRequirementsTwo.returnRequirementPurposes[0].id,
                alias: null,
                purposeId: returnRequirementsTwo.returnRequirementPurposes[0].purpose.id,
                purpose: {
                  id: returnRequirementsTwo.returnRequirementPurposes[0].purpose.id,
                  description: returnRequirementsTwo.returnRequirementPurposes[0].purpose.description
                }
              }
            ]
          },
          {
            id: returnRequirementsOne.id,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            collectionFrequency: 'week',
            fiftySixException: false,
            gravityFill: false,
            reabstraction: false,
            reportingFrequency: 'week',
            siteDescription: 'WINTER BOREHOLE AT AVALON',
            summer: false,
            twoPartTariff: false,
            points: [
              {
                id: returnRequirementsOne.points[0].id,
                description: 'WELL AT WELLINGTON'
              }
            ],
            returnRequirementPurposes: [
              {
                id: returnRequirementsOne.returnRequirementPurposes[0].id,
                alias: 'I have an alias',
                purposeId: returnRequirementsOne.returnRequirementPurposes[0].purpose.id,
                purpose: {
                  id: returnRequirementsOne.returnRequirementPurposes[0].purpose.id,
                  description: returnRequirementsOne.returnRequirementPurposes[0].purpose.description
                }
              }
            ]
          }
        ]
      })
    })
  })

  describe('when a matching return version does not exist', () => {
    it('returns nothing', async () => {
      const result = await FetchExistingRequirementsService.go('7d0c235a-6556-47dc-8d18-3b2965d49703')

      expect(result).to.be.undefined()
    })
  })
})

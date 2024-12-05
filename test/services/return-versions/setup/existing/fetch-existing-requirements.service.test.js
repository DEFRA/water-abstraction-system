'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RequirementsForReturnsSeeder = require('../../../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const FetchExistingRequirementsService = require('../../../../../app/services/return-versions/setup/existing/fetch-existing-requirements.service.js')

describe('Return Versions Setup - Fetch Existing Requirements service', () => {
  let seededReturnRequirementOne
  let seededReturnRequirementTwo
  let seededReturnVersion

  describe('when a matching return version exists', () => {
    before(async () => {
      const seedData = await RequirementsForReturnsSeeder.seed()

      seededReturnVersion = seedData.returnVersion
      seededReturnRequirementOne = seededReturnVersion.returnRequirements[0]
      seededReturnRequirementTwo = seededReturnVersion.returnRequirements[1]
    })

    it('returns the details of the requirements for returns', async () => {
      const result = await FetchExistingRequirementsService.go(seededReturnVersion.id)

      expect(result).to.equal({
        id: seededReturnVersion.id,
        multipleUpload: false,
        quarterlyReturns: false,
        returnRequirements: [
          {
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            collectionFrequency: 'week',
            fiftySixException: true,
            gravityFill: true,
            id: seededReturnRequirementTwo.id,
            points: [
              {
                id: seededReturnRequirementTwo.points[0].id,
                description: 'WELL AT WELLINGTON'
              }
            ],
            reabstraction: true,
            reportingFrequency: 'month',
            returnRequirementPurposes: [
              {
                id: seededReturnRequirementTwo.returnRequirementPurposes[0].id,
                alias: null,
                purposeId: seededReturnRequirementTwo.returnRequirementPurposes[0].purpose.id,
                purpose: {
                  id: seededReturnRequirementTwo.returnRequirementPurposes[0].purpose.id,
                  description: seededReturnRequirementTwo.returnRequirementPurposes[0].purpose.description
                }
              }
            ],
            siteDescription: 'SUMMER BOREHOLE AT AVALON',
            summer: true,
            twoPartTariff: true
          },
          {
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            collectionFrequency: 'week',
            fiftySixException: false,
            gravityFill: false,
            id: seededReturnRequirementOne.id,
            points: [
              {
                id: seededReturnRequirementOne.points[0].id,
                description: 'WELL AT WELLINGTON'
              }
            ],
            reabstraction: false,
            reportingFrequency: 'week',
            returnRequirementPurposes: [
              {
                id: seededReturnRequirementOne.returnRequirementPurposes[0].id,
                alias: 'I have an alias',
                purposeId: seededReturnRequirementOne.returnRequirementPurposes[0].purpose.id,
                purpose: {
                  id: seededReturnRequirementOne.returnRequirementPurposes[0].purpose.id,
                  description: seededReturnRequirementOne.returnRequirementPurposes[0].purpose.description
                }
              }
            ],
            siteDescription: 'WINTER BOREHOLE AT AVALON',
            summer: false,
            twoPartTariff: false
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

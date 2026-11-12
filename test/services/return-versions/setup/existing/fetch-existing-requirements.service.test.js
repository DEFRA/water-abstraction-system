// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as RequirementsForReturnsSeeder from '../../../../support/seeders/requirements-for-returns.seeder.js'

// Thing under test
import FetchExistingRequirementsService from '../../../../../src/services/return-versions/setup/existing/fetch-existing-requirements.service.js'

describe('Return Versions Setup - Fetch Existing Requirements service', () => {
  let seededReturnRequirementOne
  let seededReturnRequirementTwo
  let seededReturnVersion

  describe('when a matching return version exists', () => {
    beforeAll(async () => {
      const seedData = await RequirementsForReturnsSeeder.seed()

      seededReturnVersion = seedData.returnVersion
      seededReturnRequirementOne = seededReturnVersion.returnRequirements[0]
      seededReturnRequirementTwo = seededReturnVersion.returnRequirements[1]
    })

    it('returns the details of the requirements for returns', async () => {
      const result = await FetchExistingRequirementsService(seededReturnVersion.id)

      expect(result).toEqual({
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
                description: 'WELL AT WELLINGTON',
                id: seededReturnRequirementTwo.points[0].id
              }
            ],
            reabstraction: true,
            reportingFrequency: 'month',
            returnRequirementPurposes: [
              {
                alias: null,
                id: seededReturnRequirementTwo.returnRequirementPurposes[0].id,
                purpose: {
                  description: seededReturnRequirementTwo.returnRequirementPurposes[0].purpose.description,
                  id: seededReturnRequirementTwo.returnRequirementPurposes[0].purpose.id
                },
                purposeId: seededReturnRequirementTwo.returnRequirementPurposes[0].purpose.id
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
                description: 'WELL AT WELLINGTON',
                id: seededReturnRequirementOne.points[0].id
              }
            ],
            reabstraction: false,
            reportingFrequency: 'week',
            returnRequirementPurposes: [
              {
                alias: 'I have an alias',
                id: seededReturnRequirementOne.returnRequirementPurposes[0].id,
                purpose: {
                  description: seededReturnRequirementOne.returnRequirementPurposes[0].purpose.description,
                  id: seededReturnRequirementOne.returnRequirementPurposes[0].purpose.id
                },
                purposeId: seededReturnRequirementOne.returnRequirementPurposes[0].purpose.id
              }
            ],
            siteDescription: 'WINTER BOREHOLE AT AVALON',
            summer: false,
            twoPartTariff: false
          }
        ],
        startDate: seededReturnVersion.startDate
      })
    })
  })

  describe('when a matching return version does not exist', () => {
    it('returns nothing', async () => {
      const result = await FetchExistingRequirementsService('7d0c235a-6556-47dc-8d18-3b2965d49703')

      expect(result).toBeUndefined()
    })
  })
})

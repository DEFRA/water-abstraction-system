'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const RequirementsForReturnsSeeder = require('../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const FetchReturnVersionService = require('../../../app/services/return-requirements/fetch-return-version.service.js')

describe('Return Requirements - Fetch Return Version service', () => {
  let licence
  let returnVersion
  let user

  describe('when a matching return version exists', () => {
    beforeEach(async () => {
      const seedData = await RequirementsForReturnsSeeder.seed()

      licence = seedData.licence
      returnVersion = seedData.returnVersion
      user = seedData.user
    })

    it('returns the details of the requirements for returns', async () => {
      const result = await FetchReturnVersionService.go(returnVersion.id)

      const [returnRequirementsOne, returnRequirementsTwo] = result.returnRequirements

      expect(result).to.equal({
        createdAt: returnVersion.createdAt,
        id: returnVersion.id,
        multipleUpload: false,
        notes: null,
        reason: 'new-licence',
        startDate: new Date('2022-04-01'),
        status: 'current',
        user: { id: user.id, username: user.username },
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef,
          licenceDocument: null
        },
        modLog: {
          code: 'XRETM',
          createdAt: '2010-04-07',
          createdBy: 'BATKINSO',
          description: 'Changes to Returns requirements April 2008 (manual update)',
          note: 'AMENDED FOR GOR'
        },
        returnRequirements: [
          {
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            collectionFrequency: 'week',
            fiftySixException: false,
            gravityFill: false,
            id: returnRequirementsOne.id,
            legacyId: returnRequirementsOne.legacyId,
            returnRequirementPoints: [
              {
                description: null,
                id: returnRequirementsOne.returnRequirementPoints[0].id,
                ngr1: returnRequirementsOne.returnRequirementPoints[0].ngr1,
                ngr2: null,
                ngr3: null,
                ngr4: null
              }
            ],
            returnRequirementPurposes: [
              {
                alias: 'I have an alias',
                id: returnRequirementsOne.returnRequirementPurposes[0].id,
                purpose: {
                  description: 'Spray Irrigation - Storage',
                  id: returnRequirementsOne.returnRequirementPurposes[0].purpose.id
                }
              }
            ],
            reabstraction: false,
            reportingFrequency: 'week',
            siteDescription: 'FIRST BOREHOLE AT AVALON',
            summer: false,
            twoPartTariff: false
          },
          {
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            collectionFrequency: 'week',
            fiftySixException: true,
            gravityFill: true,
            id: returnRequirementsTwo.id,
            legacyId: returnRequirementsTwo.legacyId,
            returnRequirementPoints: [
              {
                description: null,
                id: returnRequirementsTwo.returnRequirementPoints[0].id,
                ngr1: returnRequirementsTwo.returnRequirementPoints[0].ngr1,
                ngr2: null,
                ngr3: null,
                ngr4: null
              }
            ],
            returnRequirementPurposes: [
              {
                alias: null,
                id: returnRequirementsTwo.returnRequirementPurposes[0].id,
                purpose: {
                  description: 'Spray Irrigation - Storage',
                  id: returnRequirementsTwo.returnRequirementPurposes[0].purpose.id
                }
              }
            ],
            reabstraction: true,
            reportingFrequency: 'month',
            siteDescription: 'SECOND BOREHOLE AT AVALON',
            summer: true,
            twoPartTariff: true
          }
        ]
      })
    })
  })
})

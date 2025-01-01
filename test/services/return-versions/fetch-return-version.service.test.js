'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../support/database.js')
const RequirementsForReturnsSeeder = require('../../support/seeders/requirements-for-returns.seeder.js')
const ModLogHelper = require('../../support/helpers/mod-log.helper.js')

// Thing under test
const FetchReturnVersionService = require('../../../app/services/return-versions/fetch-return-version.service.js')

describe('Return Versions - Fetch Return Version service', () => {
  let modLog
  let seededLicence
  let seededReturnRequirementOne
  let seededReturnRequirementTwo
  let seededReturnVersion
  let seededUser

  after(async () => {
    await closeConnection()
  })

  describe('when a matching return version exists', () => {
    beforeEach(async () => {
      const seedData = await RequirementsForReturnsSeeder.seed()

      seededLicence = seedData.licence
      seededReturnVersion = seedData.returnVersion

      // NOTE: We seed our return requirements out of order so we can check they're returned in the order we expect
      seededReturnRequirementOne = seededReturnVersion.returnRequirements[0]
      seededReturnRequirementTwo = seededReturnVersion.returnRequirements[1]
      seededUser = seedData.user

      modLog = await ModLogHelper.add({ returnVersionId: seededReturnVersion.id, note: 'This is a test note' })
    })

    it('returns the details of the return version', async () => {
      const result = await FetchReturnVersionService.go(seededReturnVersion.id)

      expect(result).to.equal({
        createdAt: seededReturnVersion.createdAt,
        createdBy: seededUser.id,
        id: seededReturnVersion.id,
        multipleUpload: false,
        notes: null,
        quarterlyReturns: false,
        reason: 'new-licence',
        startDate: new Date('2022-04-01'),
        status: 'current',
        user: { id: seededUser.id, username: seededUser.username },
        licence: {
          id: seededLicence.id,
          licenceRef: seededLicence.licenceRef,
          licenceDocument: null
        },
        modLogs: [
          {
            id: modLog.id,
            naldDate: new Date('2012-06-01T00:00:00.000Z'),
            note: 'This is a test note',
            reasonDescription: null,
            userId: 'TTESTER'
          }
        ],
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
            legacyId: seededReturnRequirementTwo.legacyId,
            points: [
              {
                description: 'WELL AT WELLINGTON',
                id: seededReturnRequirementTwo.points[0].id,
                ngr1: seededReturnRequirementTwo.points[0].ngr1,
                ngr2: null,
                ngr3: null,
                ngr4: null
              }
            ],
            returnRequirementPurposes: [
              {
                alias: null,
                id: seededReturnRequirementTwo.returnRequirementPurposes[0].id,
                purpose: {
                  description: 'Spray Irrigation - Storage',
                  id: seededReturnRequirementTwo.returnRequirementPurposes[0].purpose.id
                }
              }
            ],
            reabstraction: true,
            reportingFrequency: 'month',
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
            legacyId: seededReturnRequirementOne.legacyId,
            points: [
              {
                description: 'WELL AT WELLINGTON',
                id: seededReturnRequirementOne.points[0].id,
                ngr1: seededReturnRequirementOne.points[0].ngr1,
                ngr2: null,
                ngr3: null,
                ngr4: null
              }
            ],
            returnRequirementPurposes: [
              {
                alias: 'I have an alias',
                id: seededReturnRequirementOne.returnRequirementPurposes[0].id,
                purpose: {
                  description: 'Spray Irrigation - Storage',
                  id: seededReturnRequirementOne.returnRequirementPurposes[0].purpose.id
                }
              }
            ],
            reabstraction: false,
            reportingFrequency: 'week',
            siteDescription: 'WINTER BOREHOLE AT AVALON',
            summer: false,
            twoPartTariff: false
          }
        ]
      })
    })
  })
})

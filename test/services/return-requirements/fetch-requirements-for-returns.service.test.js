'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const RequirementsForReturnsSeeder = require('../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const FetchRequirementsForReturnsService = require('../../../app/services/return-requirements/fetch-requirements-for-returns.service.js')

describe('Return Requirements - Fetch Requirements for returns service', () => {
  let licence
  let returnVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when a matching return version exists', () => {
    beforeEach(async () => {
      await DatabaseSupport.clean()

      licence = await LicenceHelper.add()
      returnVersion = await RequirementsForReturnsSeeder.seed(licence.id)
    })

    it('returns the details of the requirements for returns transformed for use in the view page', async () => {
      const result = await FetchRequirementsForReturnsService.go(returnVersion.id)
      const [returnRequirementsOne, returnRequirementsTwo] = result.returnRequirements
      expect(result).to.equal({
        id: returnVersion.id,
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef,
          licenceDocument: null
        },
        multipleUpload: false,
        notes: null,
        reason: 'new-licence',
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
            points: [
              {
                description: null,
                ngr1: returnRequirementsOne.points[0].ngr1,
                ngr2: null,
                ngr3: null,
                ngr4: null
              }
            ],
            purposes: [
              {
                id: returnRequirementsOne.purposes[0].id,
                purposeDetails: {
                  description: 'Spray Irrigation - Storage'
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
            points: [
              {
                description: null,
                ngr1: returnRequirementsTwo.points[0].ngr1,
                ngr2: null,
                ngr3: null,
                ngr4: null
              }
            ],
            purposes: [
              {
                id: returnRequirementsTwo.purposes[0].id,
                purposeDetails: {
                  description: 'Spray Irrigation - Storage'
                }
              }
            ],
            reabstraction: true,
            reportingFrequency: 'month',
            siteDescription: 'SECOND BOREHOLE AT AVALON',
            summer: true,
            twoPartTariff: true
          }
        ],
        startDate: new Date('2022-04-01'),
        status: 'current'
      })
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code
const Sinon = require('sinon')

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const RequirementsForReturnsSeeder = require('../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const ViewService = require('../../../app/services/return-requirements/view.service.js')

describe('Return Requirements - View service', () => {
  let licence
  let returnVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()

    licence = await LicenceHelper.add()
    returnVersion = await RequirementsForReturnsSeeder.seed(licence.id)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go(returnVersion.id)
      const [requirementOne, requirementTwo] = result.requirements

      expect(result).to.equal({
        activeNavBar: 'search',
        additionalSubmissionOptions: {
          multipleUpload: 'No'
        },
        licenceId: licence.id,
        licenceRef: result.licenceRef,
        notes: null,
        pageTitle: 'Check the requirements for returns for null',
        reason: 'New licence',
        requirements: [
          {
            abstractionPeriod: 'From 1 April to 31 March',
            agreementsExceptions: 'None',
            frequencyCollected: 'weekly',
            frequencyReported: 'weekly',
            points: requirementOne.points,
            purposes: [
              'Spray Irrigation - Storage'
            ],
            returnReference: requirementOne.returnReference,
            returnsCycle: 'Winter and all year',
            siteDescription: 'FIRST BOREHOLE AT AVALON',
            title: 'FIRST BOREHOLE AT AVALON'
          },
          {
            abstractionPeriod: 'From 1 April to 31 March',
            agreementsExceptions: 'Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception',
            frequencyCollected: 'weekly',
            frequencyReported: 'monthly',
            points: requirementTwo.points,
            purposes: [
              'Spray Irrigation - Storage'
            ],
            returnReference: requirementTwo.returnReference,
            returnsCycle: 'Summer',
            siteDescription: 'SECOND BOREHOLE AT AVALON',
            title: 'SECOND BOREHOLE AT AVALON'
          }
        ],
        startDate: '1 April 2022',
        status: 'approved'
      }
      )
    })
  })
})

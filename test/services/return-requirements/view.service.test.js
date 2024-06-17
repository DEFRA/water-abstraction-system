'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code
const Sinon = require('sinon')

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const FetchPointsService = require('../../../app/services/return-requirements/fetch-points.service.js')
const RequirementsForReturnsSeeder = require('../../support/seeders/requirements-for-returns.seeder.js')

// Thing under test
const ViewService = require('../../../app/services/return-requirements/view.service.js')

describe('Return Requirements - View service', () => {
  const point = {
    NGR1_EAST: '69212',
    NGR1_SHEET: 'TQ',
    NGR1_NORTH: '50394',
    LOCAL_NAME: 'RIVER MEDWAY AT YALDING INTAKE'
  }

  let returnVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()

    returnVersion = await RequirementsForReturnsSeeder.seed()

    Sinon.stub(FetchPointsService, 'go').resolves([
      { ...point, ID: '1234' },
      { ...point, ID: '4321' }
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go(returnVersion.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        licenceRef: undefined,
        pageTitle: 'Check the requirements for returns for null',
        reason: 'New licence',
        requirements: [
          {
            abstractionPeriod: 'From 1 April to 31 March',
            agreementsExceptions: 'None',
            frequencyCollected: 'weekly',
            frequencyReported: 'weekly',
            points: [
              'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
            ],
            purposes: [
              'Spray Irrigation - Storage'
            ],
            returnReference: result.requirements[0].returnReference,
            returnsCycle: 'Winter and all year',
            siteDescription: 'FIRST BOREHOLE AT AVALON',
            title: 'Spray Irrigation - Storage, FIRST BOREHOLE AT AVALON'
          },
          {
            abstractionPeriod: 'From 1 April to 31 March',
            agreementsExceptions: '56 returns exception, Gravity fill, Transfer re-abstraction scheme, and Two-part tariff',
            frequencyCollected: 'weekly',
            frequencyReported: 'monthly',
            points: [
              'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
            ],
            purposes: [
              'Spray Irrigation - Storage'
            ],
            returnReference: result.requirements[1].returnReference,
            returnsCycle: 'Summer',
            siteDescription: 'SECOND BOREHOLE AT AVALON',
            title: 'Spray Irrigation - Storage, SECOND BOREHOLE AT AVALON'
          }
        ],
        startDate: '1 April 2022',
        status: 'current'
      }
      )
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Things we need to stub
const FetchLicenceSummaryService = require('../../../app/services/licences/fetch-licence-summary.service.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceSummaryService = require('../../../app/services/licences/view-licence-summary.service.js')

describe.only('View Licence Summary service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  let fetchLicenceResult

  beforeEach(() => {
    Sinon.stub(ViewLicenceService, 'go').resolves({ licenceName: 'fake licence' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    describe('and it has no optional fields', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        Sinon.stub(FetchLicenceSummaryService, 'go').resolves(fetchLicenceResult)
      })

      it('will return all the mandatory data and default values for use in the licence summary page', async () => {
        const result = await ViewLicenceSummaryService.go(testId)

        expect(result).to.equal({
          abstractionAmounts: [],
          abstractionConditions: [],
          abstractionPeriods: [],
          abstractionPeriodsAndPurposesLinkText: null,
          abstractionPeriodsCaption: 'Period of abstraction',
          abstractionPoints: ['At National Grid Reference TL 23198 88603'],
          abstractionPointsCaption: 'Point of abstraction',
          abstractionPointsLinkText: 'View details of the abstraction point',
          activeTab: 'summary',
          documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
          endDate: null,
          licenceId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
          licenceHolder: 'Unregistered licence',
          monitoringStations: [{
            id: 'ac075651-4781-4e24-a684-b943b98607ca',
            label: 'MEVAGISSEY FIRE STATION'
          }],
          licenceName: 'fake licence',
          purposes: null,
          purposesCount: 0,
          region: 'Avalon',
          sourceOfSupply: 'SURFACE WATER SOURCE OF SUPPLY',
          startDate: '1 April 2019'
        })
      })
    })
  })
})

function _testLicence () {
  return LicenceModel.fromJson({
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    expiredDate: null,
    startDate: new Date('2019-04-01'),
    region: {
      id: '740375f0-5add-4335-8ed5-b21b55b4a228',
      displayName: 'Avalon'
    },
    permitLicence: {
      purposes: [{
        ANNUAL_QTY: 'null',
        DAILY_QTY: 'null',
        HOURLY_QTY: 'null',
        INST_QTY: 'null',
        purposePoints: [{
          point_detail: {
            NGR1_SHEET: 'TL',
            NGR1_EAST: '23198',
            NGR1_NORTH: '88603'
          },
          point_source: {
            NAME: 'SURFACE WATER SOURCE OF SUPPLY'
          }
        }]
      }]
    },
    licenceVersions: [],
    licenceGaugingStations: [{
      id: 'f775f2cf-9b7c-4f1e-bb6f-6e81b34b1a8d',
      gaugingStation: {
        id: 'ac075651-4781-4e24-a684-b943b98607ca',
        label: 'MEVAGISSEY FIRE STATION'
      }
    }],
    licenceDocument: null,
    licenceDocumentHeader: { id: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb' }
  })
}

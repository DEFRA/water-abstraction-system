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
const FetchLicenceAbstractionConditionsService = require('../../../app/services/licences/fetch-licence-abstraction-conditions.service.js')
const FetchLicenceSummaryService = require('../../../app/services/licences/fetch-license-summary.service')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service')
// Thing under test
const ViewLicenceSummaryService = require('../../../app/services/licences/view-licence-summary.service')

describe('View Licence service summary', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  let fetchLicenceResult

  beforeEach(() => {
    Sinon.stub(FetchLicenceAbstractionConditionsService, 'go').resolves({
      conditions: [],
      purposeIds: [],
      numberOfConditions: 0
    })
    Sinon.stub(ViewLicenceService, 'go').resolves({ licenceName: 'fake license' })
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
          abstractionConditionDetails: {
            conditions: [],
            numberOfConditions: 0
          },
          abstractionPeriods: null,
          abstractionPeriodsAndPurposesLinkText: null,
          abstractionPointLinkText: 'View details of the abstraction point',
          abstractionPoints: [
            'At National Grid Reference TL 23198 88603'
          ],
          abstractionPointsCaption: 'Point of abstraction',
          abstractionQuantities: null,
          activeTab: 'summary',
          documentId: '40306a46-d4ce-4874-9c9e-30ab6469b3fe',
          endDate: null,
          id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
          licenceHolder: 'Unregistered licence',
          licenceName: 'fake license',
          monitoringStations: [],
          purposes: null,
          region: 'South West',
          sourceOfSupply: 'SURFACE WATER SOURCE OF SUPPLY',
          startDate: '7 March 2013'
        })
      })
    })

    describe('and it does not have a licence holder', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.licenceHolder = null
        Sinon.stub(FetchLicenceSummaryService, 'go').resolves(fetchLicenceResult)
      })

      it('will return unregistered licence for use in the licence summary page', async () => {
        const result = await ViewLicenceSummaryService.go(testId)

        expect(result.licenceHolder).to.equal('Unregistered licence')
      })
    })

    describe('and it does have a licence holder', () => {
      beforeEach(() => {
        fetchLicenceResult = _testLicence()
        fetchLicenceResult.licenceHolder = 'Test Company'
        Sinon.stub(FetchLicenceSummaryService, 'go').resolves(fetchLicenceResult)
      })

      it('will return the licence holder for use in the licence summary page', async () => {
        const result = await ViewLicenceSummaryService.go(testId)

        expect(result.licenceHolder).to.equal('Test Company')
      })
    })
  })
})

function _testLicence () {
  return LicenceModel.fromJson({
    id: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
    licenceDocumentHeader: {
      id: '40306a46-d4ce-4874-9c9e-30ab6469b3fe'
    },
    licenceRef: '01/130/R01',
    licenceName: 'Unregistered licence',
    licenceVersions: [],
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
    region: {
      id: 'adca5dd3-114d-4477-8cdd-684081429f4b',
      displayName: 'South West'
    },
    registeredTo: null,
    startDate: new Date('2013-03-07')
  })
}

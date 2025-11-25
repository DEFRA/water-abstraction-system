'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchLicenceSummaryService = require('../../../app/services/licences/fetch-licence-summary.service.js')

// Thing under test
const ViewSummaryService = require('../../../app/services/licences/view-summary.service.js')

describe('Licences - View Summary service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  let auth
  let fetchLicenceResult

  beforeEach(() => {
    auth = _auth()

    Sinon.stub(FeatureFlagsConfig, 'enableLicenceConditionsView').value(true)
    Sinon.stub(FeatureFlagsConfig, 'enableLicencePointsView').value(true)
    Sinon.stub(FeatureFlagsConfig, 'enableLicencePurposesView').value(true)
    Sinon.stub(FeatureFlagsConfig, 'enableMonitoringStationsView').value(true)
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
        const result = await ViewSummaryService.go(testId, auth)

        expect(result).to.equal({
          abstractionAmounts: [],
          abstractionConditions: [],
          abstractionPeriods: [],
          abstractionPeriodsCaption: 'Period of abstraction',
          abstractionPoints: [],
          abstractionPointsCaption: 'Point of abstraction',
          activeNavBar: 'search',
          activeSecondaryNav: 'summary',
          backLink: {
            href: '/licences',
            text: 'Go back to search'
          },
          currentVersion: 'The current version of the licence starting 1 April 2019',
          documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
          enableMonitoringStationsView: true,
          endDate: null,
          ends: null,
          includeInPresrocBilling: 'no',
          licenceHolder: 'Unregistered licence',
          licenceId: fetchLicenceResult.id,
          licenceRef: '01/123',
          monitoringStations: [
            {
              id: 'ac075651-4781-4e24-a684-b943b98607ca',
              label: 'MEVAGISSEY FIRE STATION'
            }
          ],
          notification: null,
          pageTitle: 'Licence summary 01/123',
          pageTitleCaption: 'Between two ferns',
          primaryUser: {
            id: 10036,
            username: 'grace.hopper@example.co.uk'
          },
          purposes: null,
          purposesCount: 0,
          region: 'Avalon',
          roles: ['billing', 'view_charge_versions'],
          sourceOfSupply: null,
          startDate: '1 April 2019',
          warning: null,
          workflowWarning: true
        })
      })
    })
  })
})

function _auth() {
  return {
    credentials: {
      roles: [
        {
          role: 'billing'
        },
        {
          role: 'view_charge_versions'
        }
      ]
    }
  }
}

function _testLicence() {
  const licence = LicenceModel.fromJson({
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    expiredDate: null,
    startDate: new Date('2019-04-01'),
    region: {
      id: '740375f0-5add-4335-8ed5-b21b55b4a228',
      displayName: 'Avalon'
    },
    licenceVersions: [],
    licenceMonitoringStations: [
      {
        id: 'f775f2cf-9b7c-4f1e-bb6f-6e81b34b1a8d',
        monitoringStation: {
          id: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }
      }
    ],
    licenceDocument: null,
    lapsedDate: null,
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    licenceRef: '01/123',
    revokedDate: null,
    licenceDocumentHeader: {
      id: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
      licenceName: 'Between two ferns',
      licenceEntityRoles: [
        {
          id: 'd7eecfc1-7afa-49f7-8bef-5dc477696a2d',
          licenceEntity: {
            id: 'ba7702cf-cd87-4419-a04c-8cea4e0cfdc2',
            user: {
              id: 10036,
              username: 'grace.hopper@example.co.uk'
            }
          }
        }
      ]
    },
    licenceSupplementaryYears: [],
    workflows: [{ id: 'b6f44c94-25e4-4ca8-a7db-364534157ba7', status: 'to_setup' }]
  })

  return licence
}

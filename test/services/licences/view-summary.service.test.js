'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')
const FetchSummaryService = require('../../../app/services/licences/fetch-summary.service.js')

// Thing under test
const ViewSummaryService = require('../../../app/services/licences/view-summary.service.js')

describe('Licences - View Summary service', () => {
  let auth
  let licence
  let summary

  beforeEach(() => {
    licence = LicenceModel.fromJson({
      id: generateUUID(),
      lapsedDate: null,
      includeInPresrocBilling: 'no',
      includeInSrocBilling: false,
      licenceRef: generateLicenceRef(),
      revokedDate: null,
      licenceSupplementaryYears: [],
      startDate: new Date('2019-04-01')
    })

    summary = _testSummary(licence.id)

    auth = _auth()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    describe('and it has no optional fields', () => {
      beforeEach(() => {
        Sinon.stub(FetchLicenceService, 'go').resolves(licence)
        Sinon.stub(FetchSummaryService, 'go').resolves(summary)
      })

      it('will return all the mandatory data and default values for use in the licence summary page', async () => {
        const result = await ViewSummaryService.go(licence.id, auth)

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
          endDate: null,
          issueDate: null,
          licenceHolder: 'Unregistered licence',
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          monitoringStations: [
            {
              id: summary.licenceMonitoringStations[0].monitoringStation.id,
              label: 'MEVAGISSEY FIRE STATION'
            }
          ],
          notification: null,
          pageTitle: `Licence summary ${licence.licenceRef}`,
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

function _testSummary(licenceId) {
  return LicenceModel.fromJson({
    id: licenceId,
    expiredDate: null,
    startDate: new Date('2019-04-01'),
    region: {
      id: generateUUID(),
      displayName: 'Avalon'
    },
    licenceVersions: [],
    licenceMonitoringStations: [
      {
        id: generateUUID(),
        monitoringStation: {
          id: generateUUID(),
          label: 'MEVAGISSEY FIRE STATION'
        }
      }
    ],
    licenceDocument: null,
    licenceDocumentHeader: {
      id: generateUUID(),
      licenceName: 'Between two ferns',
      licenceEntityRoles: [
        {
          id: generateUUID(),
          licenceEntity: {
            id: generateUUID(),
            user: {
              id: 10036,
              username: 'grace.hopper@example.co.uk'
            }
          }
        }
      ]
    },
    workflows: [{ id: generateUUID(), status: 'to_setup' }]
  })
}

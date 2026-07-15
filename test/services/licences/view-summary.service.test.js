// Test helpers
import LicenceModel from '../../../app/models/licence.model.js'
import LicenceHelper from '../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'
import * as FetchSummaryService from '../../../app/services/licences/fetch-summary.service.js'

// Thing under test
import ViewSummaryService from '../../../app/services/licences/view-summary.service.js'

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
      licenceRef: LicenceHelper.generateLicenceRef(),
      revokedDate: null,
      licenceSupplementaryYears: [],
      startDate: new Date('2019-04-01')
    })

    summary = _testSummary(licence.id)

    auth = _auth()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a licence with a matching ID exists', () => {
    describe('and it has no optional fields', () => {
      beforeEach(() => {
        vi.spyOn(FetchLicenceService, 'default').mockResolvedValue(licence)
        vi.spyOn(FetchSummaryService, 'default').mockResolvedValue(summary)
      })

      it('will return all the mandatory data and default values for use in the licence summary page', async () => {
        const result = await ViewSummaryService(licence.id, auth)

        expect(result).toEqual({
          abstractionAmounts: [],
          abstractionConditions: [],
          abstractionPeriods: [],
          abstractionPeriodsCaption: 'Period of abstraction',
          abstractionPoints: [],
          abstractionPointsCaption: 'Point of abstraction',
          activeSecondaryNav: 'summary',
          backLink: {
            href: '/',
            text: 'Go back to search'
          },
          currentVersion: 'The current version of the licence starting 1 April 2019',
          endDate: null,
          issueDate: null,
          licenceEnded: false,
          licenceHolder: '',
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

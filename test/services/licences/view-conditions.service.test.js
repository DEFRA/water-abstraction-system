// Test framework dependencies

// Test helpers
import * as ViewLicencesFixture from '../../support/fixtures/view-licences.fixture.js'

// Things we need to stub
import FetchConditionsService from '../../../app/services/licences/fetch-conditions.service.js'
import FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'

// Thing under test
import ViewConditionsService from '../../../app/services/licences/view-conditions.service.js'

describe('Licences - View Conditions service', () => {
  let auth
  let conditions
  let licence

  beforeEach(() => {
    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with data to display', () => {
    beforeEach(() => {
      licence = ViewLicencesFixture.licence()
      conditions = [ViewLicencesFixture.condition()]

      vi.mock('../../../app/services/licences/fetch-licence.service.js')
      FetchLicenceService.mockReturnValue(licence)

      vi.mock('../../../app/services/licences/fetch-conditions.service.js')
      FetchConditionsService.mockReturnValue(conditions)
    })

    it('correctly presents the data', async () => {
      const result = await ViewConditionsService(licence.id, auth)

      expect(result).toEqual({
        activeSecondaryNav: 'summary',
        activeSummarySubNav: 'conditions',
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
          text: 'Go back to licence summary'
        },
        conditionTypes: [
          {
            conditions: [
              {
                abstractionPoints: {
                  descriptions: [
                    'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)'
                  ],
                  label: 'Abstraction point'
                },
                conditionType: 'Cessation Condition',
                otherInformation: 'DROUGHT CONDITION',
                param1: {
                  label: 'Start date',
                  value: '01/05'
                },
                param2: {
                  label: 'End date',
                  value: '30/09'
                },
                purpose: 'Animal Watering & General Use In Non Farming Situations',
                subcodeDescription: 'Political - Hosepipe Ban'
              }
            ],
            displayTitle: 'Political cessation condition'
          }
        ],
        pageTitle: 'Conditions',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing'],
        showingConditions: 'Showing 1 type of further conditions',
        warning: {
          iconFallbackText: 'Warning',
          text: 'We may not be able to show a full list of the conditions, because we do not hold all of the licence information on our system yet. You should refer to the paper copy of the licence to view all conditions.'
        }
      })
    })
  })

  describe('when called and the licence has no current licence version or conditions', () => {
    beforeEach(() => {
      licence = ViewLicencesFixture.licence()
      licence.licenceVersions = []

      vi.mock('../../../app/services/licences/fetch-licence.service.js')
      FetchLicenceService.mockReturnValue(licence)
    })

    it('correctly presents the data', async () => {
      const result = await ViewConditionsService(licence.id, auth)

      expect(result).toEqual({
        activeSecondaryNav: 'summary',
        activeSummarySubNav: 'conditions',
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
          text: 'Go back to licence summary'
        },
        conditionTypes: [],
        pageTitle: 'Conditions',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing'],
        showingConditions: 'Showing 0 type of further conditions',
        warning: {
          text: 'We may not be able to show a full list of the conditions, because we do not hold all of the licence information on our system yet. You should refer to the paper copy of the licence to view all conditions.',
          iconFallbackText: 'Warning'
        }
      })
    })
  })
})

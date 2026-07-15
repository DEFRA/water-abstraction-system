// Test helpers
import * as ViewLicencesFixture from '../../support/fixtures/view-licences.fixture.js'

// Things we need to stub
import * as FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'
import * as FetchPurposesService from '../../../app/services/licences/fetch-purposes.service.js'

// Thing under test
import ViewPurposesService from '../../../app/services/licences/view-purposes.service.js'

describe('Licences - View Purposes service', () => {
  let auth
  let licence
  let purposes

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

    licence = ViewLicencesFixture.licence()

    purposes = [ViewLicencesFixture.licenceVersionPurpose()]

    vi.spyOn(FetchLicenceService, 'default').mockReturnValue(licence)

    vi.spyOn(FetchPurposesService, 'default').mockReturnValue(purposes)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewPurposesService(licence.id, auth)

      expect(result).toEqual({
        activeSecondaryNav: 'summary',
        activeSummarySubNav: 'purposes',
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
          text: 'Go back to licence summary'
        },
        licencePurposes: [
          {
            abstractionAmounts: [
              '180,000.00 cubic metres per year',
              '720.00 cubic metres per day',
              '144.00 cubic metres per hour',
              '40.00 litres per second'
            ],
            abstractionAmountsTitle: 'Abstraction amounts',
            abstractionMethods: 'Unspecified Pump',
            abstractionMethodsTitle: 'Method of abstraction',
            abstractionPeriod: '1 April to 31 October',
            abstractionPoints: ['At National Grid Reference TL 23198 88603'],
            abstractionPointsTitle: 'Abstraction point',
            purposeDescription: 'Spray Irrigation - Storage'
          }
        ],
        pageTitle: 'Purposes, periods and amounts',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing'],
        showingPurposes: 'Showing 1 purpose'
      })
    })
  })
})

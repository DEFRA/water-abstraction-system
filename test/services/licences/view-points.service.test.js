// Test helpers
import * as ViewLicencesFixture from '../../support/fixtures/view-licences.fixture.js'

// Things we need to stub
import * as FetchPointsService from '../../../app/services/licences/fetch-points.service.js'
import * as FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'

// Thing under test
import ViewPointsService from '../../../app/services/licences/view-points.service.js'

describe('Licences - View Points service', () => {
  let auth
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

    licence = ViewLicencesFixture.licence()

    vi.spyOn(FetchLicenceService, 'default').mockReturnValue(licence)

    vi.spyOn(FetchPointsService, 'default').mockReturnValue([
      {
        ...ViewLicencesFixture.point(),
        sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
        sourceType: 'Borehole'
      }
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewPointsService(licence.id, auth)

      expect(result).toEqual({
        activeSecondaryNav: 'summary',
        activeSummarySubNav: 'points',
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
          text: 'Go back to licence summary'
        },
        licencePoints: [
          {
            bgsReference: 'TL 14/123',
            category: 'Single Point',
            depth: '123',
            description: 'RIVER OUSE AT BLETSOE',
            gridReference:
              'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)',
            hydroInterceptDistance: '8.01',
            hydroOffsetDistance: '5.56',
            hydroReference: 'TL 14/133',
            locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
            note: 'WELL IS SPRING-FED',
            primaryType: 'Groundwater',
            secondaryType: 'Borehole',
            sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
            sourceType: 'Borehole',
            wellReference: '81312'
          }
        ],
        pageTitle: 'Points',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing'],
        showingPoints: 'Showing 1 abstraction point'
      })
    })
  })
})

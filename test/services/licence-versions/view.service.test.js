// Test framework dependencies

// Test helpers
import * as ViewLicencesFixture from '../../support/fixtures/view-licences.fixture.js'

// Things we need to stub
import FetchConditionsService from '../../../app/services/licences/fetch-conditions.service.js'
import FetchLicenceVersionDal from '../../../app/dal/licence-versions/fetch-licence-version.dal.js'
import NotifyConfig from '../../../config/notify.config.js'

// Thing under test
import ViewService from '../../../app/services/licence-versions/view.service.js'

describe('Licence Versions - View service', () => {
  let auth
  let conditions
  let licenceVersion

  beforeEach(() => {
    auth = {
      credentials: {
        scope: []
      }
    }

    licenceVersion = ViewLicencesFixture.licenceVersion()

    conditions = []

    vi.mock('../../../app/dal/licence-versions/fetch-licence-version.dal.js')
    FetchLicenceVersionDal.mockReturnValue({
      licenceVersion,
      licenceVersionsForPagination: [licenceVersion]
    })

    vi.mock('../../../app/services/licences/fetch-conditions.service.js')
    FetchConditionsService.mockReturnValue(conditions)

    vi.replaceProperty(NotifyConfig, 'replyTo', 'notify@test.gov.uk')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService(licenceVersion.id, auth)

      expect(result).toEqual({
        backLink: {
          href: `/system/licences/${licenceVersion.licence.id}/history`,
          text: 'Go back to history'
        },
        changeType: 'licence issued',
        conditionTypes: [],
        errorInDataEmail: 'notify@test.gov.uk',
        licenceDetails: {
          address: ['12 GRIMMAULD PLACE', 'ISLINGTON', 'LONDON', 'GREATER LONDON', 'N1 9LX'],
          applicationNumber: null,
          endDate: null,
          issueDate: null,
          licenceHolderName: 'ORDER OF THE PHOENIX',
          startDate: '1 January 2022'
        },
        notes: null,
        pageTitle: 'Licence version starting 1 January 2022',
        pageTitleCaption: `Licence ${licenceVersion.licence.licenceRef}`,
        pagination: null,
        points: [],
        purposes: [],
        reason: 'Licence Holder Name/Address Change'
      })
    })
  })
})

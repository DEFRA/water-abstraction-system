// Test framework dependencies

// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we want to stub
import FetchLicencesDal from '../../../../app/dal/users/external/fetch-licences.dal.js'
import FetchUserDal from '../../../../app/dal/users/fetch-user.dal.js'

// Thing under test
import ViewLicencesService from '../../../../app/services/users/external/view-licences.service.js'

describe('Users - External - View Licences service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts', 'unlink_licences'] }
  }
  const page = '1'

  let back
  let user
  let yarStub

  beforeEach(() => {
    const { id, username } = UsersFixture.external()

    user = { id, licenceEntityId: 'b2c55396-9bbb-448d-85e7-2be1dbefc02b', username }

    vi.mock('../../../../app/dal/users/fetch-user.dal.js')
    FetchUserDal.mockResolvedValue(user)
    vi.mock('../../../../app/dal/users/external/fetch-licences.dal.js')
    FetchLicencesDal.mockResolvedValue({
      licences: [],
      totalNumber: 0
    })

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicencesService(user.id, auth, page, yarStub, back)

      expect(result).toEqual({
        activeNavBar: 'users',
        activeSecondaryNav: 'licences',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 licences'
        },
        notification: undefined,
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        backQueryString: '?back=users',
        displayLicenceEndedMessage: false,
        pageTitle: 'Licences',
        pageTitleCaption: user.username,
        licences: [],
        unregisterActionLink: null
      })
    })
  })
})

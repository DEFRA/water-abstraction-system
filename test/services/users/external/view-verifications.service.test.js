// Test framework dependencies

// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'

// Things we want to stub
import * as FetchUserDal from '../../../../app/dal/users/fetch-user.dal.js'
import * as FetchVerificationsDal from '../../../../app/dal/users/external/fetch-verifications.dal.js'

// Thing under test
import ViewVerificationsService from '../../../../app/services/users/external/view-verifications.service.js'

describe('Users - External - View Verifications service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'] }
  }
  const page = '1'

  let back
  let user

  beforeEach(() => {
    const { id, username } = UsersFixture.external()

    user = { id, licenceEntityId: 'b2c55396-9bbb-448d-85e7-2be1dbefc02b', username }

    vi.spyOn(FetchUserDal, 'default').mockResolvedValue(user)
    vi.spyOn(FetchVerificationsDal, 'default').mockResolvedValue({
      verifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewVerificationsService(user.id, auth, page, back)

      expect(result).toEqual({
        activeNavBar: 'users',
        activeSecondaryNav: 'verifications',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 verifications'
        },
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        backQueryString: '?back=users',
        pageTitle: 'Verifications',
        pageTitleCaption: user.username,
        verifications: []
      })
    })
  })
})

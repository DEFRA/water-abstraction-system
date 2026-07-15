// Test helpers
import * as UsersFixture from '../../support/fixtures/users.fixture.js'
import YarStub from '../../support/stubs/yar.stub.js'

// Things to stub
import * as FetchUsersDal from '../../../app/dal/users/fetch-users.dal.js'
import FeatureFlagsConfig from '../../../config/feature-flags.config.js'

// Thing under test
import IndexUsersService from '../../../app/services/users/index-users.service.js'

describe('Users - Index Users service', () => {
  let auth
  let fetchResults
  let page
  let yarStub

  beforeEach(() => {
    vi.replaceProperty(FeatureFlagsConfig, 'enableUsersManagement', true)
    vi.replaceProperty(FeatureFlagsConfig, 'enableUsersView', true)

    auth = {
      credentials: { scope: ['manage_accounts'] }
    }

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    beforeEach(() => {
      yarStub.get.mockReturnValue(null)

      const results = [UsersFixture.transformToFetchUsersResult(UsersFixture.basicAccess())]

      fetchResults = { results, total: 1 }
      vi.spyOn(FetchUsersDal, 'default').mockResolvedValue(fetchResults)
    })

    it('returns page data for the view', async () => {
      const result = await IndexUsersService(yarStub, auth, page)
      expect(result).toEqual({
        activeNavBar: 'users',
        filters: {
          email: null,
          openFilter: false,
          permissions: null,
          status: null,
          type: null
        },
        links: {
          user: {
            href: '/system/users/internal/setup',
            text: 'Create a user'
          }
        },
        notification: undefined,
        pageTitle: 'Users',
        users: [
          {
            email: fetchResults.results[0].username,
            link: `/system/users/internal/${fetchResults.results[0].id}/details`,
            permissions: 'Basic access',
            status: 'enabled',
            type: 'Internal'
          }
        ],
        pagination: { currentPageNumber: 1, numberOfPages: 1, showingMessage: 'Showing all 1 users' }
      })
    })
  })

  describe('when the filters are assessed', () => {
    beforeEach(() => {
      // For the purposes of these tests the results don't matter
      fetchResults = { results: [], total: 0 }
      vi.spyOn(FetchUsersDal, 'default').mockResolvedValue(fetchResults)
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub.get.mockReturnValue(null)
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexUsersService(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(false)
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub.flash.mockReturnValue([])
        yarStub.get.mockReturnValue(_filters())
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexUsersService(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(false)
      })
    })

    describe('when a filter was applied', () => {
      beforeEach(() => {
        const filters = _filters()

        filters.email = 'carol.shaw@wrls.gov.uk'

        yarStub.get.mockReturnValue(filters)
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await IndexUsersService(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(true)
      })
    })
  })

  describe('when there is a notification', () => {
    beforeEach(() => {
      yarStub.flash.mockReturnValue(['Test notification'])
      yarStub.get.mockReturnValue(null)
    })

    it('sets the notification', async () => {
      const result = await IndexUsersService(yarStub, auth, page)

      expect(result.notification).toEqual('Test notification')
    })
  })
})

function _filters() {
  return {
    email: null,
    openFilter: false,
    permissions: null,
    status: null,
    type: null
  }
}

'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')
const YarStub = require('../../support/stubs/yar.stub.js')

// Things to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchUsersDal = require('../../../app/dal/users/fetch-users.dal.js')

// Thing under test
const IndexUsersService = require('../../../app/services/users/index-users.service.js')

describe('Users - Index Users service', () => {
  let auth
  let fetchResults
  let page
  let yarStub

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersManagement').value(true)
    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)

    auth = {
      credentials: { scope: ['manage_accounts'] }
    }

    yarStub = YarStub.build(Sinon)
    yarStub.flash.returns([])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      yarStub.get.returns(null)

      const results = [UsersFixture.transformToFetchUsersResult(UsersFixture.basicAccess())]

      fetchResults = { results, total: 1 }
      Sinon.stub(FetchUsersDal, 'go').resolves(fetchResults)
    })

    it('returns page data for the view', async () => {
      const result = await IndexUsersService.go(yarStub, auth, page)
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
      Sinon.stub(FetchUsersDal, 'go').resolves(fetchResults)
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub.get.returns(null)
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexUsersService.go(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(false)
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub.flash.returns([])
        yarStub.get.returns(_filters())
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexUsersService.go(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(false)
      })
    })

    describe('when a filter was applied', () => {
      beforeEach(() => {
        const filters = _filters()

        filters.email = 'carol.shaw@wrls.gov.uk'

        yarStub.get.returns(filters)
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await IndexUsersService.go(yarStub, auth, page)

        expect(result.filters.openFilter).toBe(true)
      })
    })
  })

  describe('when there is a notification', () => {
    beforeEach(() => {
      yarStub.flash.returns(['Test notification'])
      yarStub.get.returns(null)
    })

    it('sets the notification', async () => {
      const result = await IndexUsersService.go(yarStub, auth, page)

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

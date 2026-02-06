'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Things to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchUsersService = require('../../../app/services/users/fetch-users.service.js')

// Thing under test
const IndexUsersService = require('../../../app/services/users/index-users.service.js')

describe('Users - Index Users service', () => {
  let auth
  let fetchResults
  let page
  let yarStub

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)

    auth = {
      credentials: { scope: ['manage_accounts'] }
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      // For the purposes of this tests the filter doesn't matter
      yarStub = { get: Sinon.stub().returns(null) }

      const results = [UsersFixture.transformToFetchUsersResult(UsersFixture.basicAccess())]

      fetchResults = { results, total: 1 }
      Sinon.stub(FetchUsersService, 'go').resolves(fetchResults)
    })

    it('returns page data for the view', async () => {
      const result = await IndexUsersService.go(yarStub, auth, page)
      expect(result).to.equal({
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
            href: '/account/create-user',
            text: 'Create a user'
          }
        },
        pageTitle: 'Users',
        users: [
          {
            email: fetchResults.results[0].username,
            link: `/user/${fetchResults.results[0].userId}/status`,
            permissions: 'Basic access',
            status: 'enabled',
            type: 'Internal'
          }
        ],
        pagination: { numberOfPages: 1, showingMessage: 'Showing all 1 users' }
      })
    })
  })

  describe('when the filters are assessed', () => {
    beforeEach(() => {
      // For the purposes of these tests the results don't matter
      fetchResults = { results: [], total: 0 }
      Sinon.stub(FetchUsersService, 'go').resolves(fetchResults)
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(null) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexUsersService.go(yarStub, auth, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(_filters()) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await IndexUsersService.go(yarStub, auth, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('when a filter was applied', () => {
      beforeEach(() => {
        const filters = _filters()

        filters.email = 'carol.shaw@wrls.gov.uk'
        yarStub = { get: Sinon.stub().returns(filters) }
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await IndexUsersService.go(yarStub, auth, page)

        expect(result.filters.openFilter).to.be.true()
      })
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

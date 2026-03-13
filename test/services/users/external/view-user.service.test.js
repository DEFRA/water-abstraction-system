'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Things we want to stub
const FetchUserService = require('../../../../app/services/users/external/fetch-user.service.js')

// Thing under test
const ViewUserService = require('../../../../app/services/users/external/view-user.service.js')

describe('Users - External - View User service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'] }
  }
  const user = UsersFixture.external()

  let back

  beforeEach(() => {
    Sinon.stub(FetchUserService, 'go').resolves(user)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the external user view', async () => {
      const result = await ViewUserService.go(user.id, auth)

      expect(result).to.equal({
        activeNavBar: 'users',
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        companies: [],
        id: user.id,
        lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
        pageTitle: 'User external@example.co.uk',
        pageTitleCaption: 'External',
        showEditButton: true,
        status: 'enabled'
      })
    })

    describe('the "activeNavBar" property', () => {
      describe('when the "back" query parameter is "undefined"', () => {
        it('defaults to ""users" and returns "users"', async () => {
          const result = await ViewUserService.go(user.id, auth, back)

          expect(result.activeNavBar).to.equal('users')
        })
      })

      describe('when the "back" query parameter is not "users" (for example "search")', () => {
        beforeEach(() => {
          back = 'search'
        })

        it('returns "search"', async () => {
          const result = await ViewUserService.go(user.id, auth, back)

          expect(result.activeNavBar).to.equal('search')
        })
      })
    })
  })
})

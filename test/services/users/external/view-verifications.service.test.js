'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Things we want to stub
const FetchUserDal = require('../../../../app/dal/users/fetch-user.dal.js')
const FetchVerificationsDal = require('../../../../app/dal/users/external/fetch-verifications.dal.js')

// Thing under test
const ViewVerificationsService = require('../../../../app/services/users/external/view-verifications.service.js')

describe('Users - External - View Verifications service', () => {
  const page = '1'

  let back
  let user

  beforeEach(() => {
    const { id, username } = UsersFixture.external()

    user = { id, licenceEntityId: 'b2c55396-9bbb-448d-85e7-2be1dbefc02b', username }

    Sinon.stub(FetchUserDal, 'go').resolves(user)
    Sinon.stub(FetchVerificationsDal, 'go').resolves({
      verifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewVerificationsService.go(user.id, page, back)

      expect(result).to.equal({
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
        backQueryString: null,
        pageTitle: 'Verifications',
        pageTitleCaption: user.username,
        verifications: []
      })
    })

    describe('the "activeNavBar" property', () => {
      describe('when the "back" query parameter is "undefined"', () => {
        it('defaults to ""users" and returns "users"', async () => {
          const result = await ViewVerificationsService.go(user.id, page, back)

          expect(result.activeNavBar).to.equal('users')
        })
      })

      describe('when the "back" query parameter is not "users" (for example "search")', () => {
        beforeEach(() => {
          back = 'search'
        })

        it('returns "search"', async () => {
          const result = await ViewVerificationsService.go(user.id, page, back)

          expect(result.activeNavBar).to.equal('search')
        })
      })
    })
  })
})

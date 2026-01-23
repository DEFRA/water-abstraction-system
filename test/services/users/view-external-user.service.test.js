'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Things we want to stub
const FetchExternalUserService = require('../../../app/services/users/fetch-external-user.service.js')

// Thing under test
const ViewExternalUserService = require('../../../app/services/users/view-external-user.service.js')

describe('Users - View External User service', () => {
  const user = UsersFixture.external()

  beforeEach(() => {
    Sinon.stub(FetchExternalUserService, 'go').resolves(user)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the external user view', async () => {
      const result = await ViewExternalUserService.go(user.id)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        companies: [],
        id: user.id,
        lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
        pageTitle: 'User external@example.co.uk',
        pageTitleCaption: 'External',
        status: 'enabled'
      })
    })
  })
})

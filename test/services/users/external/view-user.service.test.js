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
        backLink: {
          href: '/',
          text: 'Go back to search'
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
  })
})

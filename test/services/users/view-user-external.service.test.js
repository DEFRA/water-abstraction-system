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
const FetchUserExternalService = require('../../../app/services/users/fetch-user-external.service.js')

// Thing under test
const ViewUserExternalService = require('../../../app/services/users/view-user-external.service.js')

describe('Users - View User External service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'] }
  }
  const user = UsersFixture.external()

  beforeEach(() => {
    Sinon.stub(FetchUserExternalService, 'go').resolves(user)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the external user view', async () => {
      const result = await ViewUserExternalService.go(user.id, auth)

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

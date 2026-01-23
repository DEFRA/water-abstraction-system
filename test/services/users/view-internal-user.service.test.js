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
const FetchInternalUserService = require('../../../app/services/users/fetch-internal-user.service.js')

// Thing under test
const ViewInternalUserService = require('../../../app/services/users/view-internal-user.service.js')

describe('Users - View Internal User service', () => {
  const user = UsersFixture.basicAccess()

  beforeEach(() => {
    Sinon.stub(FetchInternalUserService, 'go').resolves(user)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the internal user view', async () => {
      const result = await ViewInternalUserService.go(user.id)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        id: user.id,
        lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
        pageTitle: 'User basic.access@wrls.gov.uk',
        pageTitleCaption: 'Internal',
        permissions: 'Basic access',
        status: 'enabled'
      })
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Things we want to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchInternalUserService = require('../../../app/services/users/fetch-internal-user.service.js')

// Thing under test
const ViewInternalUserService = require('../../../app/services/users/view-internal-user.service.js')

describe('Users - View Internal User service', () => {
  const user = UsersFixture.basicAccess()

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)
    Sinon.stub(FetchInternalUserService, 'go').resolves(user)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the internal user view', async () => {
      const result = await ViewInternalUserService.go(user.id)

      expect(result).to.equal({
        activeNavBar: 'users',
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        id: user.id,
        lastSignedIn: '6 October 2022 at 10:00:00',
        pageTitle: 'User basic.access@wrls.gov.uk',
        pageTitleCaption: 'Internal',
        permissions: 'Basic access',
        roles: [],
        status: 'enabled'
      })
    })
  })
})

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
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const FetchUserDetailsDal = require('../../../../app/dal/users/internal/fetch-user-details.dal.js')

// Thing under test
const ViewDetailsService = require('../../../../app/services/users/internal/view-details.service.js')

describe('Users - Internal - View Details service', () => {
  const user = UsersFixture.basicAccess()

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)
    Sinon.stub(FetchUserDetailsDal, 'go').resolves(user)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the internal user view', async () => {
      const result = await ViewDetailsService.go(user.id)

      expect(result).to.equal({
        activeNavBar: 'users',
        activeSecondaryNav: 'details',
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        id: user.id,
        lastSignedIn: '6 October 2022 at 10:00:00',
        pageTitle: 'User details',
        pageTitleCaption: user.username,
        permissions: 'Basic access',
        roles: [],
        status: 'enabled'
      })
    })
  })
})

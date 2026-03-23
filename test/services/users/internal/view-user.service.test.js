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
const DetermineUserEditableService = require('../../../../app/services/users/internal/determine-user-editable.service.js')
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

// Thing under test
const ViewUserService = require('../../../../app/services/users/internal/view-user.service.js')

describe('Users - Internal - View User service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'], user: { id: 'dummy-id' } }
  }
  const user = UsersFixture.basicAccess()

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)
    Sinon.stub(DetermineUserEditableService, 'go').resolves({ canEdit: true, isSuper: true, user })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the internal user view', async () => {
      const result = await ViewUserService.go(user.id, auth)

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
        showEditButton: true,
        status: 'enabled'
      })
    })
  })
})

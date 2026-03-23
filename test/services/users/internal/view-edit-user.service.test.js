'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Boom = require('@hapi/boom')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const DetermineUserEditableService = require('../../../../app/services/users/internal/determine-user-editable.service.js')
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const FetchAllPermissionsDetailsService = require('../../../../app/services/users/internal/fetch-all-permissions-details.service.js')

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Thing under test
const ViewEditUserService = require('../../../../app/services/users/internal/view-edit-user.service.js')

describe('Users - Internal - View Edit User service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'], user: { id: 'dummy-id' } }
  }

  let user

  beforeEach(() => {
    user = UsersFixture.basicAccess()

    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)
    Sinon.stub(FetchAllPermissionsDetailsService, 'go').resolves({})
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      Sinon.stub(DetermineUserEditableService, 'go').resolves({ canEdit: true, isSuper: true, user })
    })

    it('returns page data for the view', async () => {
      const result = await ViewEditUserService.go(user.id, auth)

      expect(result).to.equal({
        activeNavBar: 'users',
        cancelLink: { href: `/system/users/internal/${user.id}`, text: 'Cancel' },
        id: user.id,
        lastSignedIn: '6 October 2022 at 10:00:00',
        pageTitle: 'User basic.access@wrls.gov.uk',
        pageTitleCaption: 'Internal',
        permissionOptions: [],
        permissions: 'basic',
        status: 'enabled'
      })
    })
  })

  describe('when the user cannot be edited', () => {
    beforeEach(() => {
      Sinon.stub(DetermineUserEditableService, 'go').resolves({ canEdit: false, isSuper: true, user })
    })

    it('returns a "forbidden" error', async () => {
      const result = await ViewEditUserService.go(user.id, auth)

      expect(result).to.equal(Boom.forbidden())
    })
  })
})

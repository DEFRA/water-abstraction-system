'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Boom = require('@hapi/boom')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Things to stub
const DetermineUserEditableService = require('../../../../app/services/users/internal/determine-user-editable.service.js')
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const FetchAllPermissionsDetailsService = require('../../../../app/services/users/internal/fetch-all-permissions-details.service.js')
const FetchLegacyIdService = require('../../../../app/services/users/fetch-legacy-id.service.js')
const FetchPermissionsDetailsService = require('../../../../app/services/users/internal/fetch-permissions-details.service.js')
const UpdateUserService = require('../../../../app/services/users/internal/update-user.service.js')

// Thing under test
const SubmitEditUserService = require('../../../../app/services/users/internal/submit-edit-user.service.js')

describe('Users - Internal - Submit Edit User service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'], user: { id: 'dummy-id' } }
  }

  let payload
  let user
  let updateUserServiceStub

  beforeEach(() => {
    user = UsersFixture.basicAccess()

    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)
    Sinon.stub(FetchLegacyIdService, 'go').resolves(user.userId)
    Sinon.stub(FetchAllPermissionsDetailsService, 'go').resolves({})
    Sinon.stub(FetchPermissionsDetailsService, 'go').resolves({
      groups: [{ group: 'group-1', id: 'group-id-1' }],
      roles: [{ id: 'role-id-1', role: 'role-1' }]
    })
    updateUserServiceStub = Sinon.stub(UpdateUserService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      Sinon.stub(DetermineUserEditableService, 'go').resolves({ canEdit: true, isSuper: true, user })

      payload = { permissions: 'super' }
    })

    it('calls the update service with the correct parameters', async () => {
      await SubmitEditUserService.go(user.id, payload, auth)

      expect(updateUserServiceStub.calledOnce).to.be.true()
      expect(updateUserServiceStub.firstCall.args[0]).to.equal({
        groups: [{ group: 'group-1', id: 'group-id-1' }],
        id: user.id,
        roles: [{ id: 'role-id-1', role: 'role-1' }],
        userId: user.userId
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitEditUserService.go(user.id, payload, auth)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      Sinon.stub(DetermineUserEditableService, 'go').resolves({ canEdit: true, isSuper: true, user })

      payload = { permissions: 'an-invalid-value' }
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitEditUserService.go(user.id, payload, auth)

      expect(result).to.equal({
        cancelLink: { href: `/system/users/internal/${user.id}`, text: 'Cancel' },
        error: {
          errorList: [
            {
              href: '#permissions',
              text: 'Select a valid permission'
            }
          ],
          permissions: {
            text: 'Select a valid permission'
          }
        },
        id: user.id,
        lastSignedIn: '6 October 2022 at 10:00:00',
        pageTitle: 'User basic.access@wrls.gov.uk',
        pageTitleCaption: 'Internal',
        permissionOptions: [],
        permissions: 'an-invalid-value',
        status: 'enabled'
      })
    })
  })

  describe('when the edit action is not allowed', () => {
    beforeEach(() => {
      Sinon.stub(DetermineUserEditableService, 'go').resolves({ canEdit: false, isSuper: true, user })

      payload = { permissions: 'super' }
    })

    it('returns a "forbidden" error', async () => {
      const result = await SubmitEditUserService.go(user.id, payload, auth)

      expect(result).to.equal(Boom.forbidden())
    })
  })
})

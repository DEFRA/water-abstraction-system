'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Things to stub
const FetchUserService = require('../../../../app/services/users/internal/fetch-user.service.js')

// Thing under test
const DetermineUserEditableService = require('../../../../app/services/users/internal/determine-user-editable.service.js')

describe('Users - Internal - Determine User Editable service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'], user: { id: 'dummy-id' } }
  }

  let currentUserPermissions
  let payload
  let user

  beforeEach(() => {
    user = UsersFixture.basicAccess()
    currentUserPermissions = 'super'

    Sinon.stub(FetchUserService, 'go')
      .resolves(user)
      .onFirstCall()
      .resolves({
        $permissions: () => {
          return { key: currentUserPermissions }
        }
      })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      payload = { permissions: 'super' }
    })

    it('returns the correctly determined editable status', async () => {
      const result = await DetermineUserEditableService.go(user.id, auth, payload)

      expect(result).to.equal({
        canEdit: true,
        isSuper: true,
        user
      })
    })
  })

  describe('when the current user is not a super user', () => {
    beforeEach(() => {
      currentUserPermissions = 'billing_and_data'
      payload = { permissions: 'basic' }
    })

    describe('and the user being edited is not a super user', () => {
      it('determines that the user can be edited', async () => {
        const result = await DetermineUserEditableService.go(user.id, auth, payload)

        expect(result.canEdit).to.be.true()
      })
    })

    describe('and the user being edited is a super user', () => {
      beforeEach(() => {
        user.$permissions = () => {
          return { key: 'super' }
        }
      })

      it('determines that the user cannot be edited', async () => {
        const result = await DetermineUserEditableService.go(user.id, auth, payload)

        expect(result.canEdit).to.be.false()
      })
    })

    describe('and the current user is trying to make them a super user', () => {
      beforeEach(() => {
        payload = { permissions: 'super' }
      })

      it('determines that the user cannot be edited', async () => {
        const result = await DetermineUserEditableService.go(user.id, auth, payload)

        expect(result.canEdit).to.be.false()
      })
    })
  })

  describe('when the current user is a super user', () => {
    beforeEach(() => {
      payload = { permissions: 'basic' }
    })

    describe('and the user being edited is a super user', () => {
      beforeEach(() => {
        user.$permissions = () => {
          return { key: 'super' }
        }
      })

      it('determines that the user can be edited', async () => {
        const result = await DetermineUserEditableService.go(user.id, auth, payload)

        expect(result.canEdit).to.be.true()
      })
    })

    describe('and the current user is trying to make them a super user', () => {
      beforeEach(() => {
        payload = { permissions: 'super' }
      })

      it('determines that the user can be edited', async () => {
        const result = await DetermineUserEditableService.go(user.id, auth, payload)

        expect(result.canEdit).to.be.true()
      })
    })
  })
})

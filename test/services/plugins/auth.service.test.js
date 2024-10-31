'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things to stub
const FetchUserRolesAndGroupsService = require('../../../app/services/idm/fetch-user-roles-and-groups.service.js')

// Thing under test
const AuthService = require('../../../app/services/plugins/auth.service.js')

describe('Auth service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when the user id is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchUserRolesAndGroupsService, 'go')
        .resolves({
          user: { name: 'User' },
          roles: [{ role: 'Role' }],
          groups: [{ group: 'Group' }]
        })
    })

    it('returns isValid as `true`', async () => {
      const result = await AuthService.go(12345)

      expect(result.isValid).to.be.true()
    })

    it('returns the user in credentials.user', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.user).to.equal({ name: 'User' })
    })

    it('returns the roles in credentials.roles', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.roles).to.equal([{ role: 'Role' }])
    })

    it('returns the groups in credentials.groups', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.groups).to.equal([{ group: 'Group' }])
    })

    it('returns the role names in credentials.scope', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.scope).to.equal(['Role'])
    })

    it('returns the top level permissions in credentials.permission', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.permission).to.equal({ abstractionReform: false, billRuns: false, manage: false })
    })
  })

  describe('when the user has a top-level permission role', () => {
    describe('such as "ar_user"', () => {
      beforeEach(() => {
        Sinon.stub(FetchUserRolesAndGroupsService, 'go')
          .resolves({
            user: { name: 'User' },
            roles: [{ role: 'ar_user' }],
            groups: [{ group: 'Group' }]
          })
      })

      it('returns the matching top level permission as true', async () => {
        const result = await AuthService.go(12345)

        expect(result.credentials.permission).to.equal({ abstractionReform: true, billRuns: false, manage: false })
      })
    })

    describe('such as "billing"', () => {
      beforeEach(() => {
        Sinon.stub(FetchUserRolesAndGroupsService, 'go')
          .resolves({
            user: { name: 'User' },
            roles: [{ role: 'billing' }],
            groups: [{ group: 'Group' }]
          })
      })

      it('returns the matching top level permission as true', async () => {
        const result = await AuthService.go(12345)

        // NOTE: Access to bill runs is granted for users with the 'billing' role. They also get access to the manage
        // page. So, there currently isn't a scenario where a user would see the 'Bill runs' option but not 'Manage'.
        expect(result.credentials.permission).to.equal({ abstractionReform: false, billRuns: true, manage: true })
      })
    })

    describe('such as "returns"', () => {
      beforeEach(() => {
        Sinon.stub(FetchUserRolesAndGroupsService, 'go')
          .resolves({
            user: { name: 'User' },
            roles: [{ role: 'returns' }],
            groups: [{ group: 'Group' }]
          })
      })

      it('returns the matching top level permission as true', async () => {
        const result = await AuthService.go(12345)

        expect(result.credentials.permission).to.equal({ abstractionReform: false, billRuns: false, manage: true })
      })
    })
  })

  describe('when the user id is not found', () => {
    beforeEach(() => {
      Sinon.stub(FetchUserRolesAndGroupsService, 'go')
        .resolves({
          user: null,
          roles: [],
          groups: []
        })
    })

    it('returns isValid as "false"', async () => {
      const result = await AuthService.go(12345)

      expect(result.isValid).to.be.false()
    })

    it('returns "null" in credentials.user', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.user).to.be.null()
    })

    it('returns an empty array in credentials.roles', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.roles).to.be.empty()
    })

    it('returns an empty array in credentials.groups', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.groups).to.be.empty()
    })

    it('returns an empty array in credentials.scope', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.scope).to.be.empty()
    })
  })
})

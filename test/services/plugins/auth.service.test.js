'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals')

// Things to stub (or in this case, mock)
const FetchUserRolesAndGroupsService = require('../../../app/services/idm/fetch-user-roles-and-groups.service.js')

// Thing under test
const AuthService = require('../../../app/services/plugins/auth.service.js')

describe('Auth service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the user id is found', () => {
    beforeEach(() => {
      jest.spyOn(FetchUserRolesAndGroupsService, 'go').mockResolvedValue({
        user: { name: 'User' },
        roles: [{ role: 'Role' }],
        groups: [{ group: 'Group' }]
      })
    })

    it('returns isValid as `true`', async () => {
      const result = await AuthService.go(12345)

      expect(result.isValid).toBe(true)
    })

    it('returns the user in credentials.user', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.user).toEqual({ name: 'User' })
    })

    it('returns the roles in credentials.roles', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.roles).toEqual([{ role: 'Role' }])
    })

    it('returns the groups in credentials.groups', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.groups).toEqual([{ group: 'Group' }])
    })

    it('returns the role names in credentials.scope', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.scope).toEqual(['Role'])
    })
  })

  describe('when the user id is not found', () => {
    beforeEach(() => {
      jest.spyOn(FetchUserRolesAndGroupsService, 'go').mockResolvedValue({
        user: null,
        roles: [],
        groups: []
      })
    })

    it('returns isValid as `false`', async () => {
      const result = await AuthService.go(12345)

      expect(result.isValid).toBe(false)
    })

    it('returns `null` in credentials.user', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.user).toBeNull()
    })

    it('returns an empty array in credentials.roles', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.roles).toEqual([])
    })

    it('returns an empty array in credentials.groups', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.groups).toEqual([])
    })

    it('returns an empty array in credentials.scope', async () => {
      const result = await AuthService.go(12345)

      expect(result.credentials.scope).toEqual([])
    })
  })
})

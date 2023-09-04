'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GroupHelper = require('../../support/helpers/idm/group.helper.js')
const GroupRoleHelper = require('../../support/helpers/idm/group-role.helper.js')
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const UserGroupHelper = require('../../support/helpers/idm/user-group.helper.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')
const UserRoleHelper = require('../../support/helpers/idm/user-role.helper.js')

// Thing under test
const GetUserRolesAndGroupsService = require('../../../app/services/idm/get-user-roles-and-groups.service.js')

describe.only('Get User Roles And Groups service', () => {
  let testRoleForUser
  let testRoleForGroup
  let testUser
  let testGroup

  beforeEach(async () => {
    await DatabaseHelper.clean()
    testUser = await UserHelper.add()

    // Create a role and assign it directly to the user
    testRoleForUser = await RoleHelper.add({ role: 'role_for_user' })
    await UserRoleHelper.add({ userId: testUser.userId, roleId: testRoleForUser.roleId })

    // Create a role and assign it to the user via a group
    testRoleForGroup = await RoleHelper.add({ role: 'role_for_group' })
    testGroup = await GroupHelper.add()
    await GroupRoleHelper.add({ groupId: testGroup.groupId, roleId: testRoleForGroup.roleId })
    await UserGroupHelper.add({ userId: testUser.userId, groupId: testGroup.groupId })
  })

  describe('when the user exists', () => {
    it("returns the user's roles", async () => {
      const result = await GetUserRolesAndGroupsService.go(testUser.userId)

      const roles = result.roles.map(role => role.role)

      expect(roles).to.have.length(2)
      expect(roles).to.include(['role_for_user', 'role_for_group'])
    })

    it("returns the user's groups", async () => {
      const result = await GetUserRolesAndGroupsService.go(testUser.userId)

      const groups = result.groups.map(group => group.group)

      expect(groups).to.have.length(1)
      expect(groups).to.equal(['wirs'])
    })

    describe('and the user is assigned a role they also have through a group', () => {
      beforeEach(async () => {
        await UserRoleHelper.add({ userId: testUser.userId, roleId: testRoleForGroup.roleId })
      })

      it('returns only one instance of the role', async () => {
        const result = await GetUserRolesAndGroupsService.go(testUser.userId)

        const roles = result.roles.map(role => role.role)

        expect(roles).to.have.length(2)
        expect(roles).to.include(['role_for_user', 'role_for_group'])
      })
    })
  })

  describe('when the user does not exist', () => {
    it('returns an empty roles array', async () => {
      const result = await GetUserRolesAndGroupsService.go(0)

      expect(result.roles).to.be.empty()
    })

    it('returns an empty groups array', async () => {
      const result = await GetUserRolesAndGroupsService.go(0)

      expect(result.groups).to.be.empty()
    })
  })
})

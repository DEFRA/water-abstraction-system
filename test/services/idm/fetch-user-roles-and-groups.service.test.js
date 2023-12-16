'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GroupHelper = require('../../support/helpers/group.helper.js')
const GroupRoleHelper = require('../../support/helpers/group-role.helper.js')
const RoleHelper = require('../../support/helpers/role.helper.js')
const UserGroupHelper = require('../../support/helpers/user-group.helper.js')
const UserHelper = require('../../support/helpers/user.helper.js')
const UserRoleHelper = require('../../support/helpers/user-role.helper.js')

// Thing under test
const FetchUserRolesAndGroupsService = require('../../../app/services/idm/fetch-user-roles-and-groups.service.js')

describe('Fetch User Roles And Groups service', () => {
  let testRoleForUser
  let testRoleForGroup
  let testUser
  let testGroup

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testUser = await UserHelper.add()

    // Create a role and assign it directly to the user
    testRoleForUser = await RoleHelper.add({ role: 'role_for_user' })
    await UserRoleHelper.add({ userId: testUser.id, roleId: testRoleForUser.id })

    // Create a role and assign it to the user via a group
    testRoleForGroup = await RoleHelper.add({ role: 'role_for_group' })
    testGroup = await GroupHelper.add()
    await GroupRoleHelper.add({ groupId: testGroup.id, roleId: testRoleForGroup.id })
    await UserGroupHelper.add({ userId: testUser.id, groupId: testGroup.id })

    // Create things that we don't assign to the user to test that they aren't returned
    await RoleHelper.add({ role: 'not_assigned_role' })
    const notAssignedGroup = await GroupHelper.add({ group: 'not_assigned' })
    const notAssignedGroupRole = await RoleHelper.add({ role: 'not_assigned_group_role' })
    await GroupRoleHelper.add({ groupId: notAssignedGroup.id, roleId: notAssignedGroupRole.id })
  })

  describe('when the user exists', () => {
    it('returns the user', async () => {
      const result = await FetchUserRolesAndGroupsService.go(testUser.id)

      expect(result.user).to.equal(testUser)
    })

    it("returns the user's roles", async () => {
      const result = await FetchUserRolesAndGroupsService.go(testUser.id)

      const roles = result.roles.map(role => role.role)

      expect(roles).to.have.length(2)
      expect(roles).to.only.include(['role_for_user', 'role_for_group'])
    })

    it("returns the user's groups", async () => {
      const result = await FetchUserRolesAndGroupsService.go(testUser.id)

      const groups = result.groups.map(group => group.group)

      expect(groups).to.have.length(1)
      expect(groups).to.equal(['wirs'])
    })

    describe('and the user is assigned a role they also have through a group', () => {
      beforeEach(async () => {
        await UserRoleHelper.add({ userId: testUser.id, roleId: testRoleForGroup.id })
      })

      it('returns only one instance of the role', async () => {
        const result = await FetchUserRolesAndGroupsService.go(testUser.id)

        const roles = result.roles.map(role => role.role)

        expect(roles).to.have.length(2)
        expect(roles).to.only.include(['role_for_user', 'role_for_group'])
      })
    })
  })

  describe('when the user does not exist', () => {
    it('returns `null` for `user`', async () => {
      const result = await FetchUserRolesAndGroupsService.go(0)

      expect(result.user).to.be.null()
    })

    it('returns an empty roles array', async () => {
      const result = await FetchUserRolesAndGroupsService.go(0)

      expect(result.roles).to.be.empty()
    })

    it('returns an empty groups array', async () => {
      const result = await FetchUserRolesAndGroupsService.go(0)

      expect(result.groups).to.be.empty()
    })
  })
})

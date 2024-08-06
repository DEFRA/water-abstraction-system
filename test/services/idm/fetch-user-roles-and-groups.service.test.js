'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GroupHelper = require('../../support/helpers/group.helper.js')
const GroupRoleHelper = require('../../support/helpers/group-role.helper.js')
const RoleHelper = require('../../support/helpers/role.helper.js')
const UserGroupHelper = require('../../support/helpers/user-group.helper.js')
const UserHelper = require('../../support/helpers/user.helper.js')
const UserRoleHelper = require('../../support/helpers/user-role.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchUserRolesAndGroupsService = require('../../../app/services/idm/fetch-user-roles-and-groups.service.js')

describe('Fetch User Roles And Groups service', () => {
  let groupForUser
  let notAssignedRole
  let notAssignedGroup
  let roleForUser
  let roleForGroup
  let user

  before(async () => {
    user = await UserHelper.add(
      {
        username: `${generateUUID()}@test.com`
      }
    )

    // Select a role and assign it directly to the user
    roleForUser = RoleHelper.select(0)
    await UserRoleHelper.add({ userId: user.id, roleId: roleForUser.id })

    // Select a role and assign it to the user via a group
    roleForGroup = RoleHelper.select(1)
    groupForUser = GroupHelper.select(0)
    await GroupRoleHelper.add({ groupId: groupForUser.id, roleId: roleForGroup.id })
    await UserGroupHelper.add({ userId: user.id, groupId: groupForUser.id })

    // Create a group role that we don't assign to the user to test that it isn't returned
    notAssignedRole = RoleHelper.select(2)
    notAssignedGroup = GroupHelper.select(1)

    await GroupRoleHelper.add({ groupId: notAssignedGroup.id, roleId: notAssignedRole.id })
  })

  describe('when the user exists', () => {
    it('returns the user', async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.id)

      expect(result.user).to.equal(user)
    })

    it("returns the user's roles", async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.id)

      const roles = result.roles.map((role) => {
        return role.role
      })

      expect(roles).to.have.length(2)
      expect(roles).to.include(roleForUser.role)
      expect(roles).to.include(roleForGroup.role)

      expect(roles).not.to.include(notAssignedRole.role)
    })

    it("returns the user's groups", async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.id)

      const groups = result.groups.map((group) => {
        return group.group
      })

      expect(groups).to.have.length(1)
      expect(groups).to.include(groupForUser.group)

      expect(groups).not.to.include(notAssignedGroup.group)
    })

    describe('and the user is assigned a role they also have through a group', () => {
      beforeEach(async () => {
        await UserRoleHelper.add({ userId: user.id, roleId: roleForGroup.id })
      })

      it('returns only one instance of the role', async () => {
        const result = await FetchUserRolesAndGroupsService.go(user.id)

        const roles = result.roles.map((role) => {
          return role.role
        })

        expect(roles).to.have.length(2)
        expect(roles).to.include(roleForUser.role)
        expect(roles).to.include(roleForGroup.role)
      })
    })
  })

  describe('when the user does not exist', () => {
    const unknownUserId = 0

    it('returns "null" for "user"', async () => {
      const result = await FetchUserRolesAndGroupsService.go(unknownUserId)

      expect(result.user).to.be.null()
    })

    it('returns an empty roles array', async () => {
      const result = await FetchUserRolesAndGroupsService.go(unknownUserId)

      expect(result.roles).to.be.empty()
    })

    it('returns an empty groups array', async () => {
      const result = await FetchUserRolesAndGroupsService.go(unknownUserId)

      expect(result.groups).to.be.empty()
    })
  })
})

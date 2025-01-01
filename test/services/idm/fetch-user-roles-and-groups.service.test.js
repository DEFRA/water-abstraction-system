'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../support/database.js')
const GroupHelper = require('../../support/helpers/group.helper.js')
const RoleHelper = require('../../support/helpers/role.helper.js')
const UserHelper = require('../../support/helpers/user.helper.js')
const UserRoleHelper = require('../../support/helpers/user-role.helper.js')

// Thing under test
const FetchUserRolesAndGroupsService = require('../../../app/services/idm/fetch-user-roles-and-groups.service.js')

const GROUP_ENV_OFFICER_INDEX = 0
const ROLE_RETURNS_INDEX = 0
const ROLE_HOF_NOTIFICATIONS_INDEX = 0
const USER_ENV_OFFICER_INDEX = 2

describe('Fetch User Roles And Groups service', () => {
  let duplicateRoleForUser
  let groupForUser
  let roleForUser
  let user

  before(async () => {
    user = UserHelper.select(USER_ENV_OFFICER_INDEX)

    // Select a role and assign it directly to the user
    roleForUser = RoleHelper.select(ROLE_RETURNS_INDEX)
    await UserRoleHelper.add({ userId: user.id, roleId: roleForUser.id })

    // Select a group and assign it to the user via a group
    groupForUser = GroupHelper.select(GROUP_ENV_OFFICER_INDEX)

    // The result will be the users has 3 roles; 1 directly via user roles and 2 via the user group
  })

  after(async () => {
    await closeConnection()
  })

  describe('when the user exists', () => {
    it('returns the user', async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.id)

      expect(result.user).to.equal(user, { skip: ['createdAt', 'licenceEntityId', 'password', 'updatedAt'] })
    })

    it("returns the user's roles", async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.id)

      const roles = result.roles.map((role) => {
        return role.role
      })

      expect(roles).to.have.length(3)

      // 1 via the user role
      expect(roles).to.include('returns')

      // 2 via the user group (environment officer has 2 roles in group_roles)
      expect(roles).to.include('hof_notifications')
      expect(roles).to.include('manage_gauging_station_licence_links')
    })

    it("returns the user's groups", async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.id)

      const groups = result.groups.map((group) => {
        return group.group
      })

      expect(groups).to.have.length(1)
      expect(groups).to.include(groupForUser.group)
    })

    describe('and the user is assigned a role they also have through a group', () => {
      beforeEach(async () => {
        duplicateRoleForUser = RoleHelper.select(ROLE_HOF_NOTIFICATIONS_INDEX)

        await UserRoleHelper.add({ userId: user.id, roleId: duplicateRoleForUser.id })
      })

      it('returns only one instance of the role', async () => {
        const result = await FetchUserRolesAndGroupsService.go(user.id)

        const roles = result.roles.map((role) => {
          return role.role
        })

        // 1 via the user role (ignoring the duplicate hof_notifications)
        expect(roles).to.include('returns')

        // 2 via the user group (environment officer has 2 roles in group_roles)
        expect(roles).to.include('hof_notifications')
        expect(roles).to.include('manage_gauging_station_licence_links')
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

'use strict'

// Test helpers
const GroupHelper = require('../../support/helpers/group.helper.js')
const RoleHelper = require('../../support/helpers/role.helper.js')
const UserHelper = require('../../support/helpers/user.helper.js')
const UserGroupHelper = require('../../support/helpers/user-group.helper.js')
const UserRoleHelper = require('../../support/helpers/user-role.helper.js')

// Thing under test
const FetchUserRolesAndGroupsService = require('../../../app/services/idm/fetch-user-roles-and-groups.service.js')

const GROUP_ENV_OFFICER_INDEX = 0
const ROLE_RETURNS_INDEX = 0
const ROLE_HOF_NOTIFICATIONS_INDEX = 0

describe('Fetch User Roles And Groups service', () => {
  let duplicateRoleForUser
  let groupForUser
  let roleForUser
  let user

  beforeAll(async () => {
    user = await UserHelper.add({ application: 'water_admin', enabled: true, username: 'unit.test@wrls.gov.uk' })

    // Select a role and assign it directly to the user
    roleForUser = RoleHelper.select(ROLE_RETURNS_INDEX)
    await UserRoleHelper.add({ userId: user.userId, roleId: roleForUser.id })

    // Select a group and assign it to the user via a group
    groupForUser = GroupHelper.select(GROUP_ENV_OFFICER_INDEX)
    await UserGroupHelper.add({ userId: user.userId, groupId: groupForUser.id })

    // The result will be the users has 3 roles; 1 directly via user roles and 2 via the user group
  })

  describe('when the user exists', () => {
    it('returns the user', async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.userId)

      expect(result.user).toMatchObject(user)
    })

    it("returns the user's roles", async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.userId)

      const roles = result.roles.map((role) => {
        return role.role
      })

      expect(roles).toHaveLength(3)

      // 1 via the user role
      expect(roles).toContain('returns')

      // 2 via the user group
      expect(roles).toContain('hof_notifications')
      expect(roles).toContain('manage_gauging_station_licence_links')
    })

    it("returns the user's groups", async () => {
      const result = await FetchUserRolesAndGroupsService.go(user.userId)

      const groups = result.groups.map((group) => {
        return group.group
      })

      expect(groups).toHaveLength(1)
      expect(groups).toContainEqual(groupForUser.group)
    })

    describe('and the user is assigned a role they also have through a group', () => {
      beforeEach(async () => {
        duplicateRoleForUser = RoleHelper.select(ROLE_HOF_NOTIFICATIONS_INDEX)

        await UserRoleHelper.add({ userId: user.userId, roleId: duplicateRoleForUser.id })
      })

      it('returns only one instance of the role', async () => {
        const result = await FetchUserRolesAndGroupsService.go(user.userId)

        const roles = result.roles.map((role) => {
          return role.role
        })

        // 1 via the user role (ignoring the duplicate hof_notifications)
        expect(roles).toContain('returns')

        // 2 via the user group (environment officer has 2 roles in group_roles)
        expect(roles).toContain('hof_notifications')
        expect(roles).toContain('manage_gauging_station_licence_links')
      })
    })
  })

  describe('when the user does not exist', () => {
    const unknownUserId = 0

    it('returns "null" for "user"', async () => {
      const result = await FetchUserRolesAndGroupsService.go(unknownUserId)

      expect(result.user).toBeNull()
    })

    it('returns an empty roles array', async () => {
      const result = await FetchUserRolesAndGroupsService.go(unknownUserId)

      expect(result.roles).toHaveLength(0)
    })

    it('returns an empty groups array', async () => {
      const result = await FetchUserRolesAndGroupsService.go(unknownUserId)

      expect(result.groups).toHaveLength(0)
    })
  })
})

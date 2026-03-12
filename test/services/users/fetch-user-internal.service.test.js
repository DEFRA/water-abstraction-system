'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const GroupRoleHelper = require('../../support/helpers/group-role.helper.js')
const RoleHelper = require('../../support/helpers/role.helper.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const FetchUserInternalService = require('../../../app/services/users/fetch-user-internal.service.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Users - Fetch User Internal service', () => {
  let groupRoles
  let roles
  let user

  describe('when called', () => {
    beforeEach(() => {
      user = UsersFixture.digitiseApprover()

      // Grab the groupRole records for the group attached to our seeded user
      groupRoles = GroupRoleHelper.data.filter((groupRole) => {
        return groupRole.groupId === user.groups[0].id
      })

      const seededRoles = RoleHelper.data

      // From those determine which roles should be attached to the user. Be aware, these are distinct from 'user roles'
      // which is why we have picked the Digitise Approver for this test, as it has both group and user roles.
      roles = groupRoles.map((groupRole) => {
        const matchingRole = seededRoles.find((seededRole) => {
          return seededRole.id === groupRole.roleId
        })

        return {
          description: matchingRole.description,
          id: matchingRole.id,
          role: matchingRole.role
        }
      })

      // Sort the roles to into alphabetical order
      roles.sort((a, b) => {
        return a.role.localeCompare(b.role)
      })
    })

    it('returns the requested user', async () => {
      const result = await FetchUserInternalService.go(user.id)

      expect(result).to.equal({
        id: user.id,
        username: user.username,
        enabled: true,
        lastLogin: user.lastLogin,
        statusPassword: null,
        application: 'water_admin',
        licenceEntity: null,
        groups: [
          {
            group: user.groups[0].group,
            id: user.groups[0].id,
            roles
          }
        ],
        roles: [
          {
            id: user.roles[0].id,
            role: user.roles[0].role,
            description: user.roles[0].description
          }
        ]
      })
    })
  })
})

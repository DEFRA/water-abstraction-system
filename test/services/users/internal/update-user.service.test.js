'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const GroupHelper = require('../../../support/helpers/group.helper.js')
const RoleHelper = require('../../../support/helpers/role.helper.js')
const UserGroupHelper = require('../../../support/helpers/user-group.helper.js')
const UserGroupModel = require('../../../../app/models/user-group.model.js')
const UserHelper = require('../../../support/helpers/user.helper.js')
const UserRoleHelper = require('../../../support/helpers/user-role.helper.js')
const UserRoleModel = require('../../../../app/models/user-role.model.js')

// Thing under test
const UpdateUserService = require('../../../../app/services/users/internal/update-user.service.js')

describe('Users - Internal - Update User service', () => {
  let user
  let group
  let role

  beforeEach(async () => {
    user = await UserHelper.add()
  })

  afterEach(async () => {
    // Cascading deletes are inconsistently implemented in the database, so we need to manually delete any user groups
    // and roles that were created during the tests before deleting the user itself
    await UserGroupModel.query().delete().where('userId', user.userId)
    await UserRoleModel.query().delete().where('userId', user.userId)

    await user.$query().delete()
  })

  describe('when called', () => {
    beforeEach(() => {
      group = GroupHelper.select(0)
      role = RoleHelper.select(0)
      user.groups = [group]
      user.roles = [role]
    })

    it('correctly sets the groups and roles', async () => {
      await UpdateUserService.go(user)

      const userGroups = await UserGroupModel.query().where('userId', user.userId).select(['groupId', 'id', 'userId'])
      const userRoles = await UserRoleModel.query().where('userId', user.userId).select(['id', 'roleId', 'userId'])

      expect(userGroups).to.equal([{ groupId: group.id, userId: user.userId }], { skip: ['id'] })
      expect(userRoles).to.equal([{ roleId: role.id, userId: user.userId }], { skip: ['id'] })
    })
  })

  describe('when the user has existing groups and roles', () => {
    beforeEach(async () => {
      group = GroupHelper.select(1)
      role = RoleHelper.select(1)
      await UserGroupHelper.add({ groupId: group.id, userId: user.userId })
      await UserRoleHelper.add({ roleId: role.id, userId: user.userId })

      user.groups = []
      user.roles = []
    })

    it('removes the existing groups and roles', async () => {
      await UpdateUserService.go(user)

      const userGroups = await UserGroupModel.query().where('userId', user.userId)
      const userRoles = await UserRoleModel.query().where('userId', user.userId)

      expect(userGroups).to.equal([])
      expect(userRoles).to.equal([])
    })
  })
})

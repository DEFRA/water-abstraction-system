'use strict'

// Test helpers
const GroupHelper = require('../../support/helpers/idm/group.helper.js')
const GroupRoleHelper = require('../../support/helpers/idm/group-role.helper.js')
const GroupRoleModel = require('../../../app/models/idm/group-role.model.js')
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const RoleModel = require('../../../app/models/idm/role.model.js')
const UserGroupHelper = require('../../support/helpers/idm/user-group.helper.js')
const UserGroupModel = require('../../../app/models/idm/user-group.model.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')
const UserModel = require('../../../app/models/idm/user.model.js')

// Thing under test
const GroupModel = require('../../../app/models/idm/group.model.js')

describe('Group model', () => {
  let testGroupRole
  let testRecord
  let testRole
  let testUser
  let testUserGroup

  beforeAll(async () => {
    testRecord = await GroupHelper.add()
    testRole = await RoleHelper.add()
    testUser = await UserHelper.add()

    testUserGroup = await UserGroupHelper.add({ userId: testUser.userId, groupId: testRecord.groupId })
    testGroupRole = await GroupRoleHelper.add({ groupId: testRecord.groupId, roleId: testRole.roleId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await GroupModel.query().findById(testRecord.groupId)

      expect(result).toBeInstanceOf(GroupModel)
      expect(result.groupId).toBe(testRecord.groupId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group roles', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupModel.query()
          .innerJoinRelated('groupRoles')

        expect(query).toBeTruthy()
      })

      it('can eager load the group roles', async () => {
        const result = await GroupModel.query()
          .findById(testRecord.groupId)
          .withGraphFetched('groupRoles')

        expect(result).toBeInstanceOf(GroupModel)
        expect(result.groupId).toBe(testRecord.groupId)

        expect(result.groupRoles).toBeInstanceOf(Array)
        expect(result.groupRoles).toHaveLength(1)
        expect(result.groupRoles[0]).toBeInstanceOf(GroupRoleModel)
        expect(result.groupRoles).toContainEqual(testGroupRole)
      })
    })

    describe('when linking through group roles to roles', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupModel.query()
          .innerJoinRelated('roles')

        expect(query).toBeTruthy()
      })

      it('can eager load the roles', async () => {
        const result = await GroupModel.query()
          .findById(testRecord.groupId)
          .withGraphFetched('roles')

        expect(result).toBeInstanceOf(GroupModel)
        expect(result.groupId).toBe(testRecord.groupId)

        expect(result.roles).toBeInstanceOf(Array)
        expect(result.roles).toHaveLength(1)
        expect(result.roles[0]).toBeInstanceOf(RoleModel)
        expect(result.roles).toContainEqual(testRole)
      })
    })

    describe('when linking to user groups', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupModel.query()
          .innerJoinRelated('userGroups')

        expect(query).toBeTruthy()
      })

      it('can eager load the user groups', async () => {
        const result = await GroupModel.query()
          .findById(testRecord.groupId)
          .withGraphFetched('userGroups')

        expect(result).toBeInstanceOf(GroupModel)
        expect(result.groupId).toBe(testRecord.groupId)

        expect(result.userGroups).toBeInstanceOf(Array)
        expect(result.userGroups).toHaveLength(1)
        expect(result.userGroups[0]).toBeInstanceOf(UserGroupModel)
        expect(result.userGroups).toContainEqual(testUserGroup)
      })
    })

    describe('when linking through user groups to users', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupModel.query()
          .innerJoinRelated('users')

        expect(query).toBeTruthy()
      })

      it('can eager load the users', async () => {
        const result = await GroupModel.query()
          .findById(testRecord.groupId)
          .withGraphFetched('users')

        expect(result).toBeInstanceOf(GroupModel)
        expect(result.groupId).toBe(testRecord.groupId)

        expect(result.users).toBeInstanceOf(Array)
        expect(result.users).toHaveLength(1)
        expect(result.users[0]).toBeInstanceOf(UserModel)
        expect(result.users).toContainEqual(testUser)
      })
    })
  })
})

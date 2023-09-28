'use strict'

// Test helpers
const GroupHelper = require('../../support/helpers/idm/group.helper.js')
const GroupModel = require('../../../app/models/idm/group.model.js')
const GroupRoleHelper = require('../../support/helpers/idm/group-role.helper.js')
const GroupRoleModel = require('../../../app/models/idm/group-role.model.js')
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')
const UserModel = require('../../../app/models/idm/user.model.js')
const UserRoleHelper = require('../../support/helpers/idm/user-role.helper.js')
const UserRoleModel = require('../../../app/models/idm/user-role.model.js')

// Thing under test
const RoleModel = require('../../../app/models/idm/role.model.js')

describe('Role model', () => {
  let testGroup
  let testGroupRole
  let testRecord
  let testUser
  let testUserRole

  beforeAll(async () => {
    testRecord = await RoleHelper.add()
    testGroup = await GroupHelper.add()
    testUser = await UserHelper.add()

    testGroupRole = await GroupRoleHelper.add({ roleId: testRecord.roleId, groupId: testGroup.groupId })
    testUserRole = await UserRoleHelper.add({ userId: testUser.userId, roleId: testRecord.roleId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await RoleModel.query().findById(testRecord.roleId)

      expect(result).toBeInstanceOf(RoleModel)
      expect(result.roleId).toBe(testRecord.roleId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group roles', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query()
          .innerJoinRelated('groupRoles')

        expect(query).toBeTruthy()
      })

      it('can eager load the group roles', async () => {
        const result = await RoleModel.query()
          .findById(testRecord.roleId)
          .withGraphFetched('groupRoles')

        expect(result).toBeInstanceOf(RoleModel)
        expect(result.roleId).toBe(testRecord.roleId)

        expect(result.groupRoles).toBeInstanceOf(Array)
        expect(result.groupRoles).toHaveLength(1)
        expect(result.groupRoles[0]).toBeInstanceOf(GroupRoleModel)
        expect(result.groupRoles).toContainEqual(testGroupRole)
      })
    })

    describe('when linking to user roles', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query()
          .innerJoinRelated('userRoles')

        expect(query).toBeTruthy()
      })

      it('can eager load the user roles', async () => {
        const result = await RoleModel.query()
          .findById(testRecord.roleId)
          .withGraphFetched('userRoles')

        expect(result).toBeInstanceOf(RoleModel)
        expect(result.roleId).toBe(testRecord.roleId)

        expect(result.userRoles).toBeInstanceOf(Array)
        expect(result.userRoles).toHaveLength(1)
        expect(result.userRoles[0]).toBeInstanceOf(UserRoleModel)
        expect(result.userRoles).toContainEqual(testUserRole)
      })
    })

    describe('when linking through group roles to groups', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query()
          .innerJoinRelated('groups')

        expect(query).toBeTruthy()
      })

      it('can eager load the groups', async () => {
        const result = await RoleModel.query()
          .findById(testRecord.roleId)
          .withGraphFetched('groups')

        expect(result).toBeInstanceOf(RoleModel)
        expect(result.roleId).toBe(testRecord.roleId)

        expect(result.groups).toBeInstanceOf(Array)
        expect(result.groups).toHaveLength(1)
        expect(result.groups[0]).toBeInstanceOf(GroupModel)
        expect(result.groups).toContainEqual(testGroup)
      })
    })

    describe('when linking through user roles to users', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query()
          .innerJoinRelated('users')

        expect(query).toBeTruthy()
      })

      it('can eager load the users', async () => {
        const result = await RoleModel.query()
          .findById(testRecord.roleId)
          .withGraphFetched('users')

        expect(result).toBeInstanceOf(RoleModel)
        expect(result.roleId).toBe(testRecord.roleId)

        expect(result.users).toBeInstanceOf(Array)
        expect(result.users).toHaveLength(1)
        expect(result.users[0]).toBeInstanceOf(UserModel)
        expect(result.users).toContainEqual(testUser)
      })
    })
  })
})

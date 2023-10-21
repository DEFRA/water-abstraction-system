'use strict'

// Test helpers
const GroupHelper = require('../../support/helpers/idm/group.helper.js')
const GroupModel = require('../../../app/models/idm/group.model.js')
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const RoleModel = require('../../../app/models/idm/role.model.js')
const UserGroupHelper = require('../../support/helpers/idm/user-group.helper.js')
const UserGroupModel = require('../../../app/models/idm/user-group.model.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')
const UserRoleHelper = require('../../support/helpers/idm/user-role.helper.js')
const UserRoleModel = require('../../../app/models/idm/user-role.model.js')

// Thing under test
const UserModel = require('../../../app/models/idm/user.model.js')

describe('User model', () => {
  let testGroup
  let testRecord
  let testRole
  let testUserGroup
  let testUserRole

  beforeAll(async () => {
    testGroup = await GroupHelper.add()
    testRecord = await UserHelper.add()
    testRole = await RoleHelper.add()

    testRecord = await UserHelper.add()

    testUserGroup = await UserGroupHelper.add({ groupId: testGroup.groupId, userId: testRecord.userId })
    testUserRole = await UserRoleHelper.add({ roleId: testRole.roleId, userId: testRecord.userId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserModel.query().findById(testRecord.userId)

      expect(result).toBeInstanceOf(UserModel)
      expect(result.userId).toBe(testRecord.userId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to user groups', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('userGroups')

        expect(query).toBeTruthy()
      })

      it('can eager load the user groups', async () => {
        const result = await UserModel.query()
          .findById(testRecord.userId)
          .withGraphFetched('userGroups')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toBe(testRecord.userId)

        expect(result.userGroups).toBeInstanceOf(Array)
        expect(result.userGroups).toHaveLength(1)
        expect(result.userGroups[0]).toBeInstanceOf(UserGroupModel)
        expect(result.userGroups).toContainEqual(testUserGroup)
      })
    })

    describe('when linking to user roles', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('userRoles')

        expect(query).toBeTruthy()
      })

      it('can eager load the user roles', async () => {
        const result = await UserModel.query()
          .findById(testRecord.userId)
          .withGraphFetched('userRoles')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toBe(testRecord.userId)

        expect(result.userRoles).toBeInstanceOf(Array)
        expect(result.userRoles).toHaveLength(1)
        expect(result.userRoles[0]).toBeInstanceOf(UserRoleModel)
        expect(result.userRoles).toContainEqual(testUserRole)
      })
    })

    describe('when linking through user roles to roles', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('roles')

        expect(query).toBeTruthy()
      })

      it('can eager load the roles', async () => {
        const result = await UserModel.query()
          .findById(testRecord.userId)
          .withGraphFetched('roles')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toBe(testRecord.userId)

        expect(result.roles).toBeInstanceOf(Array)
        expect(result.roles).toHaveLength(1)
        expect(result.roles[0]).toBeInstanceOf(RoleModel)
        expect(result.roles).toContainEqual(testRole)
      })
    })

    describe('when linking through user groups to groups', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('groups')

        expect(query).toBeTruthy()
      })

      it('can eager load the groups', async () => {
        const result = await UserModel.query()
          .findById(testRecord.userId)
          .withGraphFetched('groups')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toBe(testRecord.userId)

        expect(result.groups).toBeInstanceOf(Array)
        expect(result.groups).toHaveLength(1)
        expect(result.groups[0]).toBeInstanceOf(GroupModel)
        expect(result.groups).toContainEqual(testGroup)
      })
    })
  })

  describe('#generateHashedPassword()', () => {
    it('can successfully generate a hashed password', () => {
      const result = UserModel.generateHashedPassword('password')

      // Hashed passwords always begin with $
      expect(result.charAt(0)).toBe('$')
    })
  })
})

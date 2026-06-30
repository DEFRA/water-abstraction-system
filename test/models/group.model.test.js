'use strict'

// Test helpers
const GroupHelper = require('../support/helpers/group.helper.js')
const GroupRoleHelper = require('../support/helpers/group-role.helper.js')
const GroupRoleModel = require('../../app/models/group-role.model.js')
const RoleHelper = require('../support/helpers/role.helper.js')
const RoleModel = require('../../app/models/role.model.js')
const UserGroupHelper = require('../support/helpers/user-group.helper.js')
const UserGroupModel = require('../../app/models/user-group.model.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')

// Thing under test
const GroupModel = require('../../app/models/group.model.js')

const GROUP_ROLE_WIRS_RTNS_INDEX = 5
const GROUP_WIRS_INDEX = 2
const ROLE_RTNS_INDEX = 0
const USER_GROUP_WIRS_INDEX = 3
const USER_WIRS_INDEX = 3

describe('Group model', () => {
  let testGroupRole
  let testRecord
  let testRole
  let testUser
  let testUserGroup

  beforeAll(async () => {
    testRecord = GroupHelper.select(GROUP_WIRS_INDEX)

    testGroupRole = GroupRoleHelper.select(GROUP_ROLE_WIRS_RTNS_INDEX)
    testRole = RoleHelper.select(ROLE_RTNS_INDEX)
    testUser = UserHelper.select(USER_WIRS_INDEX)
    testUserGroup = UserGroupHelper.select(USER_GROUP_WIRS_INDEX)
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await GroupModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(GroupModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group roles', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupModel.query().innerJoinRelated('groupRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the group roles', async () => {
        const result = await GroupModel.query().findById(testRecord.id).withGraphFetched('groupRoles')

        expect(result).toBeInstanceOf(GroupModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.groupRoles).toBeInstanceOf(Array)
        expect(result.groupRoles).toHaveLength(1)
        expect(result.groupRoles[0]).toBeInstanceOf(GroupRoleModel)
        expect(result.groupRoles[0]).toMatchObject(testGroupRole)
      })
    })

    describe('when linking through group roles to roles', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupModel.query().innerJoinRelated('roles')

        expect(query).toBeDefined()
      })

      it('can eager load the roles', async () => {
        const result = await GroupModel.query().findById(testRecord.id).withGraphFetched('roles')

        expect(result).toBeInstanceOf(GroupModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.roles).toBeInstanceOf(Array)
        expect(result.roles).toHaveLength(1)
        expect(result.roles[0]).toBeInstanceOf(RoleModel)
        expect(result.roles[0]).toMatchObject(testRole)
      })
    })

    describe('when linking to user groups', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupModel.query().innerJoinRelated('userGroups')

        expect(query).toBeDefined()
      })

      it('can eager load the user groups', async () => {
        const result = await GroupModel.query().findById(testRecord.id).withGraphFetched('userGroups')

        expect(result).toBeInstanceOf(GroupModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.userGroups).toBeInstanceOf(Array)
        expect(result.userGroups).toHaveLength(1)
        expect(result.userGroups[0]).toBeInstanceOf(UserGroupModel)
        expect(result.userGroups[0]).toMatchObject(testUserGroup)
      })
    })

    describe('when linking through user groups to users', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupModel.query().innerJoinRelated('users')

        expect(query).toBeDefined()
      })

      it('can eager load the users', async () => {
        const result = await GroupModel.query().findById(testRecord.id).withGraphFetched('users')

        expect(result).toBeInstanceOf(GroupModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.users).toBeInstanceOf(Array)
        expect(result.users).toHaveLength(1)
        expect(result.users[0]).toBeInstanceOf(UserModel)
        expect(result.users[0]).toMatchObject({ ...testUser, password: expect.any(String) })
      })
    })
  })
})

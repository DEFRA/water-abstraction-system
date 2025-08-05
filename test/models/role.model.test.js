'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const GroupHelper = require('../support/helpers/group.helper.js')
const GroupModel = require('../../app/models/group.model.js')
const GroupRoleHelper = require('../support/helpers/group-role.helper.js')
const GroupRoleModel = require('../../app/models/group-role.model.js')
const RoleHelper = require('../support/helpers/role.helper.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')
const UserRoleHelper = require('../support/helpers/user-role.helper.js')
const UserRoleModel = require('../../app/models/user-role.model.js')

// Thing under test
const RoleModel = require('../../app/models/role.model.js')

const GROUP_ROLE_SUPER_AR_USER_INDEX = 16
const GROUP_SUPER_INDEX = 5
const ROLE_AR_USER_INDEX = 6
const USER_SUPER_INDEX = 1

const { skipCompareList: skip } = UserHelper

describe('Role model', () => {
  let testGroup
  let testGroupRole
  let testRecord
  let testUser
  let testUserRole

  before(async () => {
    // This combination has one match in group roles and so ensures we only get one result making testing clearer
    testRecord = RoleHelper.select(ROLE_AR_USER_INDEX)
    testGroup = GroupHelper.select(GROUP_SUPER_INDEX)
    testGroupRole = GroupRoleHelper.select(GROUP_ROLE_SUPER_AR_USER_INDEX)
    testUser = UserHelper.select(USER_SUPER_INDEX)
    testUserRole = await UserRoleHelper.add({ roleId: testRecord.id, userId: testUser.id })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await RoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(RoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group roles', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query().innerJoinRelated('groupRoles')

        expect(query).to.exist()
      })

      it('can eager load the group roles', async () => {
        const result = await RoleModel.query().findById(testRecord.id).withGraphFetched('groupRoles')

        expect(result).to.be.instanceOf(RoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.groupRoles).to.be.an.array()
        expect(result.groupRoles).to.have.length(1)
        expect(result.groupRoles[0]).to.be.an.instanceOf(GroupRoleModel)
        expect(result.groupRoles[0]).to.equal(testGroupRole, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to user roles', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query().innerJoinRelated('userRoles')

        expect(query).to.exist()
      })

      it('can eager load the user roles', async () => {
        const result = await RoleModel.query().findById(testRecord.id).withGraphFetched('userRoles')

        expect(result).to.be.instanceOf(RoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.userRoles).to.be.an.array()
        expect(result.userRoles).to.have.length(1)
        expect(result.userRoles[0]).to.be.an.instanceOf(UserRoleModel)
        expect(result.userRoles[0]).to.equal(testUserRole)
      })
    })

    describe('when linking through group roles to groups', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query().innerJoinRelated('groups')

        expect(query).to.exist()
      })

      it('can eager load the groups', async () => {
        const result = await RoleModel.query().findById(testRecord.id).withGraphFetched('groups')

        expect(result).to.be.instanceOf(RoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.groups).to.be.an.array()
        expect(result.groups).to.have.length(1)
        expect(result.groups[0]).to.be.an.instanceOf(GroupModel)
        expect(result.groups[0]).to.equal(testGroup, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking through user roles to users', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query().innerJoinRelated('users')

        expect(query).to.exist()
      })

      it('can eager load the users', async () => {
        const result = await RoleModel.query().findById(testRecord.id).withGraphFetched('users')

        expect(result).to.be.instanceOf(RoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.users).to.be.an.array()
        expect(result.users).to.have.length(1)
        expect(result.users[0]).to.be.an.instanceOf(UserModel)
        expect(result.users[0]).to.equal(testUser, { skip })
      })
    })
  })
})

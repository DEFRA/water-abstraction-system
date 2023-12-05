'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
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

describe('Group model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await GroupHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await GroupModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(GroupModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group roles', () => {
      let testGroupRole

      beforeEach(async () => {
        testRecord = await GroupHelper.add()
        testGroupRole = await GroupRoleHelper.add({ groupId: testRecord.id })
      })

      it('can successfully run a related query', async () => {
        const query = await GroupModel.query()
          .innerJoinRelated('groupRoles')

        expect(query).to.exist()
      })

      it('can eager load the group roles', async () => {
        const result = await GroupModel.query()
          .findById(testRecord.id)
          .withGraphFetched('groupRoles')

        expect(result).to.be.instanceOf(GroupModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.groupRoles).to.be.an.array()
        expect(result.groupRoles).to.have.length(1)
        expect(result.groupRoles[0]).to.be.an.instanceOf(GroupRoleModel)
        expect(result.groupRoles[0]).to.equal(testGroupRole)
      })
    })

    describe('when linking through group roles to roles', () => {
      let testRole

      beforeEach(async () => {
        testRecord = await GroupHelper.add()
        testRole = await RoleHelper.add()
        await GroupRoleHelper.add({ groupId: testRecord.id, roleId: testRole.id })
      })

      it('can successfully run a related query', async () => {
        const query = await GroupModel.query()
          .innerJoinRelated('roles')

        expect(query).to.exist()
      })

      it('can eager load the roles', async () => {
        const result = await GroupModel.query()
          .findById(testRecord.id)
          .withGraphFetched('roles')

        expect(result).to.be.instanceOf(GroupModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.roles).to.be.an.array()
        expect(result.roles).to.have.length(1)
        expect(result.roles[0]).to.be.an.instanceOf(RoleModel)
        expect(result.roles[0]).to.equal(testRole)
      })
    })

    describe('when linking to user groups', () => {
      let testUserGroup

      beforeEach(async () => {
        testRecord = await GroupHelper.add()
        testUserGroup = await UserGroupHelper.add({ groupId: testRecord.id })
      })

      it('can successfully run a related query', async () => {
        const query = await GroupModel.query()
          .innerJoinRelated('userGroups')

        expect(query).to.exist()
      })

      it('can eager load the user groups', async () => {
        const result = await GroupModel.query()
          .findById(testRecord.id)
          .withGraphFetched('userGroups')

        expect(result).to.be.instanceOf(GroupModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.userGroups).to.be.an.array()
        expect(result.userGroups).to.have.length(1)
        expect(result.userGroups[0]).to.be.an.instanceOf(UserGroupModel)
        expect(result.userGroups[0]).to.equal(testUserGroup)
      })
    })

    describe('when linking through user groups to users', () => {
      let testUser

      beforeEach(async () => {
        testRecord = await GroupHelper.add()
        testUser = await UserHelper.add()
        await UserGroupHelper.add({ userId: testUser.id, groupId: testRecord.id })
      })

      it('can successfully run a related query', async () => {
        const query = await GroupModel.query()
          .innerJoinRelated('users')

        expect(query).to.exist()
      })

      it('can eager load the users', async () => {
        const result = await GroupModel.query()
          .findById(testRecord.id)
          .withGraphFetched('users')

        expect(result).to.be.instanceOf(GroupModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.users).to.be.an.array()
        expect(result.users).to.have.length(1)
        expect(result.users[0]).to.be.an.instanceOf(UserModel)
        expect(result.users[0]).to.equal(testUser)
      })
    })
  })
})

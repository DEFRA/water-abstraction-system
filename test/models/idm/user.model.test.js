'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
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
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await UserHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await UserModel.query().findById(testRecord.userId)

      expect(result).to.be.an.instanceOf(UserModel)
      expect(result.userId).to.equal(testRecord.userId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to user groups', () => {
      let testUserGroup

      beforeEach(async () => {
        testRecord = await UserHelper.add()
        testUserGroup = await UserGroupHelper.add({ userId: testRecord.userId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('userGroups')

        expect(query).to.exist()
      })

      it('can eager load the user groups', async () => {
        const result = await UserModel.query()
          .findById(testRecord.userId)
          .withGraphFetched('userGroups')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.userId).to.equal(testRecord.userId)

        expect(result.userGroups).to.be.an.array()
        expect(result.userGroups).to.have.length(1)
        expect(result.userGroups[0]).to.be.an.instanceOf(UserGroupModel)
        expect(result.userGroups[0]).to.equal(testUserGroup)
      })
    })

    describe('when linking to user roles', () => {
      let testUserRole

      beforeEach(async () => {
        testRecord = await UserHelper.add()
        testUserRole = await UserRoleHelper.add({ userId: testRecord.userId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('userRoles')

        expect(query).to.exist()
      })

      it('can eager load the user roles', async () => {
        const result = await UserModel.query()
          .findById(testRecord.userId)
          .withGraphFetched('userRoles')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.userId).to.equal(testRecord.userId)

        expect(result.userRoles).to.be.an.array()
        expect(result.userRoles).to.have.length(1)
        expect(result.userRoles[0]).to.be.an.instanceOf(UserRoleModel)
        expect(result.userRoles[0]).to.equal(testUserRole)
      })
    })

    describe('when linking through user roles to roles', () => {
      let testRole

      beforeEach(async () => {
        testRecord = await UserHelper.add()
        testRole = await RoleHelper.add()
        await UserRoleHelper.add({ userId: testRecord.userId, roleId: testRole.roleId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('roles')

        expect(query).to.exist()
      })

      it('can eager load the roles', async () => {
        const result = await UserModel.query()
          .findById(testRecord.userId)
          .withGraphFetched('roles')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.userId).to.equal(testRecord.userId)

        expect(result.roles).to.be.an.array()
        expect(result.roles).to.have.length(1)
        expect(result.roles[0]).to.be.an.instanceOf(RoleModel)
        expect(result.roles[0]).to.equal(testRole)
      })
    })

    describe('when linking through user groups to groups', () => {
      let testGroup

      beforeEach(async () => {
        testRecord = await UserHelper.add()
        testGroup = await GroupHelper.add()
        await UserGroupHelper.add({ userId: testRecord.userId, groupId: testGroup.groupId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('groups')

        expect(query).to.exist()
      })

      it('can eager load the groups', async () => {
        const result = await UserModel.query()
          .findById(testRecord.userId)
          .withGraphFetched('groups')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.userId).to.equal(testRecord.userId)

        expect(result.groups).to.be.an.array()
        expect(result.groups).to.have.length(1)
        expect(result.groups[0]).to.be.an.instanceOf(GroupModel)
        expect(result.groups[0]).to.equal(testGroup)
      })
    })
  })

  describe('#generateHashedPassword()', () => {
    it('can successfully generate a hashed password', () => {
      const result = UserModel.generateHashedPassword('password')

      // Hashed passwords always begin with $
      expect(result.charAt(0)).to.equal('$')
    })
  })
})

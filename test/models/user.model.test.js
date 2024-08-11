'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GroupHelper = require('../support/helpers/group.helper.js')
const GroupModel = require('../../app/models/group.model.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../app/models/return-version.model.js')
const RoleHelper = require('../support/helpers/role.helper.js')
const RoleModel = require('../../app/models/role.model.js')
const UserGroupHelper = require('../support/helpers/user-group.helper.js')
const UserGroupModel = require('../../app/models/user-group.model.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserRoleHelper = require('../support/helpers/user-role.helper.js')
const UserRoleModel = require('../../app/models/user-role.model.js')

// Thing under test
const UserModel = require('../../app/models/user.model.js')

const GROUP_WIRS_INDEX = 2
const ROLE_RETURNS_INDEX = 0
const USER_GROUP_WIRS_INDEX = 3
const USER_WIRS_INDEX = 3

describe('User model', () => {
  let testGroup
  let testRecord
  let testRole
  let testUserRole
  let testUserGroup

  before(async () => {
    testRecord = UserHelper.select(USER_WIRS_INDEX)

    testRole = RoleHelper.select(ROLE_RETURNS_INDEX)
    testGroup = GroupHelper.select(GROUP_WIRS_INDEX)
    testUserGroup = UserGroupHelper.select(USER_GROUP_WIRS_INDEX)

    testUserRole = await UserRoleHelper.add({ userId: testRecord.id, roleId: testRole.id })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(UserModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking through user groups to groups', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('groups')

        expect(query).to.exist()
      })

      it('can eager load the groups', async () => {
        const result = await UserModel.query()
          .findById(testRecord.id)
          .withGraphFetched('groups')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.groups).to.be.an.array()
        expect(result.groups).to.have.length(1)
        expect(result.groups[0]).to.be.an.instanceOf(GroupModel)
        expect(result.groups[0]).to.equal(testGroup, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to return versions', () => {
      let testReturnVersions

      beforeEach(async () => {
        testReturnVersions = []
        for (let i = 0; i < 2; i++) {
          const returnVersion = await ReturnVersionHelper.add({ createdBy: testRecord.id })

          testReturnVersions.push(returnVersion)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('returnVersions')

        expect(query).to.exist()
      })

      it('can eager load the return versions', async () => {
        const result = await UserModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnVersions')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnVersions).to.be.an.array()
        expect(result.returnVersions[0]).to.be.an.instanceOf(ReturnVersionModel)
        expect(result.returnVersions).to.include(testReturnVersions[0])
        expect(result.returnVersions).to.include(testReturnVersions[1])
      })
    })

    describe('when linking through user roles to roles', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('roles')

        expect(query).to.exist()
      })

      it('can eager load the roles', async () => {
        const result = await UserModel.query()
          .findById(testRecord.id)
          .withGraphFetched('roles')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.roles).to.be.an.array()
        expect(result.roles).to.have.length(1)
        expect(result.roles[0]).to.be.an.instanceOf(RoleModel)
        expect(result.roles[0]).to.equal(testRole, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to user groups', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('userGroups')

        expect(query).to.exist()
      })

      it('can eager load the user groups', async () => {
        const result = await UserModel.query()
          .findById(testRecord.id)
          .withGraphFetched('userGroups')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.userGroups).to.be.an.array()
        expect(result.userGroups).to.have.length(1)
        expect(result.userGroups[0]).to.be.an.instanceOf(UserGroupModel)
        expect(result.userGroups[0]).to.equal(testUserGroup, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to user roles', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query()
          .innerJoinRelated('userRoles')

        expect(query).to.exist()
      })

      it('can eager load the user roles', async () => {
        const result = await UserModel.query()
          .findById(testRecord.id)
          .withGraphFetched('userRoles')

        expect(result).to.be.instanceOf(UserModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.userRoles).to.be.an.array()
        expect(result.userRoles).to.have.length(1)
        expect(result.userRoles[0]).to.be.an.instanceOf(UserRoleModel)
        expect(result.userRoles[0]).to.equal(testUserRole)
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

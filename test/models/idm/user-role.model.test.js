'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RoleModel = require('../../../app/models/idm/role.model.js')
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const UserRoleHelper = require('../../support/helpers/idm/user-role.helper.js')
const UserModel = require('../../../app/models/idm/user.model.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')

// Thing under test
const UserRoleModel = require('../../../app/models/idm/user-role.model.js')

describe('User Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await UserRoleHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await UserRoleModel.query().findById(testRecord.userRoleId)

      expect(result).to.be.an.instanceOf(UserRoleModel)
      expect(result.userRoleId).to.equal(testRecord.userRoleId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to role', () => {
      let testRole

      beforeEach(async () => {
        testRole = await RoleHelper.add()
        testRecord = await UserRoleHelper.add({ roleId: testRole.roleId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserRoleModel.query()
          .innerJoinRelated('role')

        expect(query).to.exist()
      })

      it('can eager load the role', async () => {
        const result = await UserRoleModel.query()
          .findById(testRecord.userRoleId)
          .withGraphFetched('role')

        expect(result).to.be.instanceOf(UserRoleModel)
        expect(result.userRoleId).to.equal(testRecord.userRoleId)

        expect(result.role).to.be.an.instanceOf(RoleModel)
        expect(result.role).to.equal(testRole)
      })
    })

    describe('when linking to user', () => {
      let testUser

      beforeEach(async () => {
        testUser = await UserHelper.add()
        testRecord = await UserRoleHelper.add({ userId: testUser.userId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserRoleModel.query()
          .innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await UserRoleModel.query()
          .findById(testRecord.userRoleId)
          .withGraphFetched('user')

        expect(result).to.be.instanceOf(UserRoleModel)
        expect(result.userRoleId).to.equal(testRecord.userRoleId)

        expect(result.user).to.be.an.instanceOf(UserModel)
        expect(result.user).to.equal(testUser)
      })
    })
  })
})

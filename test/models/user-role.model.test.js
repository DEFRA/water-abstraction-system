'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const RoleModel = require('../../app/models/role.model.js')
const RoleHelper = require('../support/helpers/role.helper.js')
const UserRoleHelper = require('../support/helpers/user-role.helper.js')
const UserModel = require('../../app/models/user.model.js')
const UserHelper = require('../support/helpers/user.helper.js')

// Thing under test
const UserRoleModel = require('../../app/models/user-role.model.js')

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
      const result = await UserRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(UserRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to role', () => {
      let testRole

      beforeEach(async () => {
        testRole = await RoleHelper.add()
        testRecord = await UserRoleHelper.add({ roleId: testRole.id })
      })

      it('can successfully run a related query', async () => {
        const query = await UserRoleModel.query()
          .innerJoinRelated('role')

        expect(query).to.exist()
      })

      it('can eager load the role', async () => {
        const result = await UserRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('role')

        expect(result).to.be.instanceOf(UserRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.role).to.be.an.instanceOf(RoleModel)
        expect(result.role).to.equal(testRole)
      })
    })

    describe('when linking to user', () => {
      let testUser

      beforeEach(async () => {
        testUser = await UserHelper.add()
        testRecord = await UserRoleHelper.add({ userId: testUser.id })
      })

      it('can successfully run a related query', async () => {
        const query = await UserRoleModel.query()
          .innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await UserRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('user')

        expect(result).to.be.instanceOf(UserRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.user).to.be.an.instanceOf(UserModel)
        expect(result.user).to.equal(testUser)
      })
    })
  })
})

'use strict'

// Test helpers
const RoleModel = require('../../../app/models/idm/role.model.js')
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const UserRoleHelper = require('../../support/helpers/idm/user-role.helper.js')
const UserModel = require('../../../app/models/idm/user.model.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')

// Thing under test
const UserRoleModel = require('../../../app/models/idm/user-role.model.js')

describe('User Role model', () => {
  let testRecord
  let testRole
  let testUser

  beforeAll(async () => {
    testRole = await RoleHelper.add()
    testUser = await UserHelper.add()
    testRecord = await UserRoleHelper.add({ roleId: testRole.roleId, userId: testUser.userId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserRoleModel.query().findById(testRecord.userRoleId)

      expect(result).toBeInstanceOf(UserRoleModel)
      expect(result.userRoleId).toBe(testRecord.userRoleId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to role', () => {
      it('can successfully run a related query', async () => {
        const query = await UserRoleModel.query()
          .innerJoinRelated('role')

        expect(query).toBeTruthy()
      })

      it('can eager load the role', async () => {
        const result = await UserRoleModel.query()
          .findById(testRecord.userRoleId)
          .withGraphFetched('role')

        expect(result).toBeInstanceOf(UserRoleModel)
        expect(result.userRoleId).toBe(testRecord.userRoleId)

        expect(result.role).toBeInstanceOf(RoleModel)
        expect(result.role).toEqual(testRole)
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await UserRoleModel.query()
          .innerJoinRelated('user')

        expect(query).toBeTruthy()
      })

      it('can eager load the user', async () => {
        const result = await UserRoleModel.query()
          .findById(testRecord.userRoleId)
          .withGraphFetched('user')

        expect(result).toBeInstanceOf(UserRoleModel)
        expect(result.userRoleId).toBe(testRecord.userRoleId)

        expect(result.user).toBeInstanceOf(UserModel)
        expect(result.user).toEqual(testUser)
      })
    })
  })
})

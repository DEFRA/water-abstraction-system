'use strict'

// Test helpers
const GroupHelper = require('../../support/helpers/idm/group.helper.js')
const GroupModel = require('../../../app/models/idm/group.model.js')
const GroupRoleHelper = require('../../support/helpers/idm/group-role.helper.js')
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const RoleModel = require('../../../app/models/idm/role.model.js')

// Thing under test
const GroupRoleModel = require('../../../app/models/idm/group-role.model.js')

describe('Group Role model', () => {
  let testGroup
  let testRecord
  let testRole

  beforeAll(async () => {
    testGroup = await GroupHelper.add()
    testRole = await RoleHelper.add()

    testRecord = await GroupRoleHelper.add({
      groupId: testGroup.groupId,
      roleId: testRole.roleId
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await GroupRoleModel.query()
        .findById(testRecord.groupRoleId)

      expect(result).toBeInstanceOf(GroupRoleModel)
      expect(result.groupRoleId).toBe(testRecord.groupRoleId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to role', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupRoleModel.query()
          .innerJoinRelated('role')

        expect(query).toBeTruthy()
      })

      it('can eager load the role', async () => {
        const result = await GroupRoleModel.query()
          .findById(testRecord.groupRoleId)
          .withGraphFetched('role')

        expect(result).toBeInstanceOf(GroupRoleModel)
        expect(result.groupRoleId).toBe(testRecord.groupRoleId)

        expect(result.role).toBeInstanceOf(RoleModel)
        expect(result.role).toEqual(testRole)
      })
    })

    describe('when linking to group', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupRoleModel.query()
          .innerJoinRelated('group')

        expect(query).toBeTruthy()
      })

      it('can eager load the group', async () => {
        const result = await GroupRoleModel.query()
          .findById(testRecord.groupRoleId)
          .withGraphFetched('group')

        expect(result).toBeInstanceOf(GroupRoleModel)
        expect(result.groupRoleId).toBe(testRecord.groupRoleId)

        expect(result.group).toBeInstanceOf(GroupModel)
        expect(result.group).toEqual(testGroup)
      })
    })
  })
})

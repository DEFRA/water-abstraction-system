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
const GroupRoleHelper = require('../../support/helpers/idm/group-role.helper.js')
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const RoleModel = require('../../../app/models/idm/role.model.js')

// Thing under test
const GroupRoleModel = require('../../../app/models/idm/group-role.model.js')

describe('Group Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await GroupRoleHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await GroupRoleModel.query()
        .findById(testRecord.groupRoleId)

      expect(result).to.be.an.instanceOf(GroupRoleModel)
      expect(result.groupRoleId).to.equal(testRecord.groupRoleId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to role', () => {
      let testRole

      beforeEach(async () => {
        testRole = await RoleHelper.add()
        testRecord = await GroupRoleHelper.add({ roleId: testRole.roleId })
      })

      it('can successfully run a related query', async () => {
        const query = await GroupRoleModel.query()
          .innerJoinRelated('role')

        expect(query).to.exist()
      })

      it('can eager load the role', async () => {
        const result = await GroupRoleModel.query()
          .findById(testRecord.groupRoleId)
          .withGraphFetched('role')

        expect(result).to.be.instanceOf(GroupRoleModel)
        expect(result.groupRoleId).to.equal(testRecord.groupRoleId)

        expect(result.role).to.be.an.instanceOf(RoleModel)
        expect(result.role).to.equal(testRole)
      })
    })

    describe('when linking to group', () => {
      let testGroup

      beforeEach(async () => {
        testGroup = await GroupHelper.add()
        testRecord = await GroupRoleHelper.add({ groupId: testGroup.groupId })
      })

      it('can successfully run a related query', async () => {
        const query = await GroupRoleModel.query()
          .innerJoinRelated('group')

        expect(query).to.exist()
      })

      it('can eager load the group', async () => {
        const result = await GroupRoleModel.query()
          .findById(testRecord.groupRoleId)
          .withGraphFetched('group')

        expect(result).to.be.instanceOf(GroupRoleModel)
        expect(result.groupRoleId).to.equal(testRecord.groupRoleId)

        expect(result.group).to.be.an.instanceOf(GroupModel)
        expect(result.group).to.equal(testGroup)
      })
    })
  })
})

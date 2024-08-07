'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GroupHelper = require('../support/helpers/group.helper.js')
const GroupModel = require('../../app/models/group.model.js')
const GroupRoleHelper = require('../support/helpers/group-role.helper.js')
const RoleHelper = require('../support/helpers/role.helper.js')
const RoleModel = require('../../app/models/role.model.js')

// Thing under test
const GroupRoleModel = require('../../app/models/group-role.model.js')

describe('Group Role model', () => {
  let testGroup
  let testRecord
  let testRole

  before(async () => {
    testRecord = GroupRoleHelper.select(GroupRoleHelper.DEFAULT_INDEX)

    testGroup = GroupHelper.select(GroupHelper.DEFAULT_INDEX)
    testRole = RoleHelper.select(RoleHelper.DEFAULT_INDEX)
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await GroupRoleModel.query()
        .findById(testRecord.id)

      expect(result).to.be.an.instanceOf(GroupRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to role', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupRoleModel.query()
          .innerJoinRelated('role')

        expect(query).to.exist()
      })

      it('can eager load the role', async () => {
        const result = await GroupRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('role')

        expect(result).to.be.instanceOf(GroupRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.role).to.be.an.instanceOf(RoleModel)
        expect(result.role).to.equal(testRole, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to group', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupRoleModel.query()
          .innerJoinRelated('group')

        expect(query).to.exist()
      })

      it('can eager load the group', async () => {
        const result = await GroupRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('group')

        expect(result).to.be.instanceOf(GroupRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.group).to.be.an.instanceOf(GroupModel)
        expect(result.group).to.equal(testGroup, { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })
})

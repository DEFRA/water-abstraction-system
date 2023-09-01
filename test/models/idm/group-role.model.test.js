'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GroupRoleHelper = require('../../support/helpers/idm/group-role.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const GroupRoleModel = require('../../../app/models/idm/group-role.model.js')

describe('Group Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await GroupRoleHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await GroupRoleModel.query().findById(testRecord.groupRoleId)

      expect(result).to.be.an.instanceOf(GroupRoleModel)
      expect(result.groupRoleId).to.equal(testRecord.groupRoleId)
    })
  })
})

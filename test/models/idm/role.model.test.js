'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const RoleHelper = require('../../support/helpers/idm/role.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const RoleModel = require('../../../app/models/idm/role.model.js')

describe('Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await RoleHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await RoleModel.query().findById(testRecord.roleId)

      expect(result).to.be.an.instanceOf(RoleModel)
      expect(result.roleId).to.equal(testRecord.roleId)
    })
  })
})

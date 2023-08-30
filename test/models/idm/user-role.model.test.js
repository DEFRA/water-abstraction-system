'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const UserRoleHelper = require('../../support/helpers/idm/user-role.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const UserRoleModel = require('../../../app/models/idm/user-role.model.js')

describe('User Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await UserRoleHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserRoleModel.query().findById(testRecord.userRoleId)

      expect(result).to.be.an.instanceOf(UserRoleModel)
      expect(result.userRoleId).to.equal(testRecord.userRoleId)
    })
  })
})

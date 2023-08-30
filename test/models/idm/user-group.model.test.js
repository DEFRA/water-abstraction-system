'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const UserGroupHelper = require('../../support/helpers/idm/user-group.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const UserGroupModel = require('../../../app/models/idm/user-group.model.js')

describe('User Group model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await UserGroupHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserGroupModel.query().findById(testRecord.userGroupId)

      expect(result).to.be.an.instanceOf(UserGroupModel)
      expect(result.userGroupId).to.equal(testRecord.userGroupId)
    })
  })
})

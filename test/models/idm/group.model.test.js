'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GroupHelper = require('../../support/helpers/idm/group.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const GroupModel = require('../../../app/models/idm/group.model.js')

describe('Group model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await GroupHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await GroupModel.query().findById(testRecord.groupId)

      expect(result).to.be.an.instanceOf(GroupModel)
      expect(result.groupId).to.equal(testRecord.groupId)
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const UserHelper = require('../../support/helpers/idm/user.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const UserModel = require('../../../app/models/idm/user.model.js')

describe('User model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await UserHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserModel.query().findById(testRecord.userId)

      expect(result).to.be.an.instanceOf(UserModel)
      expect(result.userId).to.equal(testRecord.userId)
    })
  })

  describe('#generateHashedPassword()', () => {
    it('can successfully generate a hashed password', () => {
      const result = UserModel.generateHashedPassword('password')

      // Hashed passwords always begin with $
      expect(result.charAt(0)).to.equal('$')
    })
  })
})

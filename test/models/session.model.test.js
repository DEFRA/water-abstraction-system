'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const SessionHelper = require('../support/helpers/session.helper.js')

// Thing under test
const SessionModel = require('../../app/models/session.model.js')

describe('Session model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await SessionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await SessionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(SessionModel)
      expect(result.id).to.equal(testRecord.id)
      expect(result.data).to.equal({})
    })
  })
})

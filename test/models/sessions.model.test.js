'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const SessionsHelper = require('../support/helpers/sessions.helper.js')

// Thing under test
const SessionsModel = require('../../app/models/sessions.model.js')

describe('Sessions model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await SessionsHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await SessionsModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(SessionsModel)
      expect(result.id).to.equal(testRecord.id)
      expect(result.data).to.equal({})
    })
  })
})

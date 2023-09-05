'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const VersionHelper = require('../../support/helpers/returns/version.helper.js')

// Thing under test
const VersionModel = require('../../../app/models/returns/version.model.js')

describe('Version model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await VersionHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await VersionModel.query().findById(testRecord.versionId)

      expect(result).to.be.an.instanceOf(VersionModel)
      expect(result.versionId).to.equal(testRecord.versionId)
    })
  })
})

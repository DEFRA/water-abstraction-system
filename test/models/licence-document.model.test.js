'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceDocumentHelper = require('../support/helpers/licence-document.helper.js')

// Thing under test
const LicenceDocumentModel = require('../../app/models/licence-document.model.js')

describe.only('Licence Document model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await LicenceDocumentHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})

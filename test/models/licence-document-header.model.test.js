'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')

// Thing under test
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')

describe('Licence Document Header model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceDocumentHeaderHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentHeaderModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentHeaderModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})

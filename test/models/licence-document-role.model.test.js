'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')

// Thing under test
const LicenceDocumentRoleModel = require('../../app/models/licence-document-role.model.js')

describe('Licence Document Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await LicenceDocumentRoleHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})

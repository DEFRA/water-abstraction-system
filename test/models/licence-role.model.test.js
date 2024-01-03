'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceRoleHelper = require('../support/helpers/licence-role.helper.js')

// Thing under test
const LicenceRoleModel = require('../../app/models/licence-role.model.js')

describe('Licence Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await LicenceRoleHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')

// Thing under test
const LicenceEntityRoleModel = require('../../app/models/licence-entity-role.model.js')

describe('Licence Entity Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceEntityRoleHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceEntityRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceEntityRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceEntityHelper = require('../support/helpers/licence-entity.helper.js')

// Thing under test
const LicenceEntityModel = require('../../app/models/licence-entity.model.js')

describe('Licence Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceEntityHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceEntityModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceEntityModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})

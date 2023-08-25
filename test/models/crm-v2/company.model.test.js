'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')

describe('Company model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await CompanyHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await CompanyModel.query().findById(testRecord.companyId)

      expect(result).to.be.an.instanceOf(CompanyModel)
      expect(result.companyId).to.equal(testRecord.companyId)
    })
  })
})

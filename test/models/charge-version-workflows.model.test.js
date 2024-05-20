'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionWorkflowHelper = require('../support/helpers/charge-version-workflow.helper.js')
const DatabaseSupport = require('../support/database.js')

// Thing under test
const ChargeVersionWorkflowModel = require('../../app/models/charge-version-workflows.model.js')

describe.only('Charge version workflow model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await ChargeVersionWorkflowHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionWorkflowModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChargeVersionWorkflowModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})

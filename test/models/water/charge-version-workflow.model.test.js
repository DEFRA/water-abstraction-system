'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionWorkflowHelper = require('../../support/helpers/water/charge-version-workflow.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')

// Thing under test
const ChargeVersionWorkflowModel = require('../../../app/models/water/charge-version-workflow.model.js')

describe('Charge Version Workflow model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ChargeVersionWorkflowHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionWorkflowModel.query().findById(testRecord.chargeVersionWorkflowId)

      expect(result).to.be.an.instanceOf(ChargeVersionWorkflowModel)
      expect(result.chargeVersionWorkflowId).to.equal(testRecord.chargeVersionWorkflowId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceId } = testLicence
        testRecord = await ChargeVersionWorkflowHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeVersionWorkflowModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ChargeVersionWorkflowModel.query()
          .findById(testRecord.chargeVersionWorkflowId)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(ChargeVersionWorkflowModel)
        expect(result.chargeVersionWorkflowId).to.equal(testRecord.chargeVersionWorkflowId)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})

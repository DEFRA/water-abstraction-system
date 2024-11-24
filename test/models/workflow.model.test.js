'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const WorkflowHelper = require('../support/helpers/workflow.helper.js')

// Thing under test
const WorkflowModel = require('../../app/models/workflow.model.js')

describe('Workflow model', () => {
  let testRecord

  beforeEach(async () => {
    testRecord = await WorkflowHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await WorkflowModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(WorkflowModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { id: licenceId } = testLicence

        testRecord = await WorkflowHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await WorkflowModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await WorkflowModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(WorkflowModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})

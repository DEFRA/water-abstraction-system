'use strict'

// Test helpers
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const WorkflowHelper = require('../../support/helpers/water/workflow.helper.js')

// Thing under test
const WorkflowModel = require('../../../app/models/water/workflow.model.js')

describe('Workflow model', () => {
  let testLicence
  let testRecord

  beforeEach(async () => {
    testLicence = await LicenceHelper.add()

    const { licenceId } = testLicence
    testRecord = await WorkflowHelper.add({ licenceId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await WorkflowModel.query().findById(testRecord.chargeVersionWorkflowId)

      expect(result).toBeInstanceOf(WorkflowModel)
      expect(result.chargeVersionWorkflowId).toBe(testRecord.chargeVersionWorkflowId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await WorkflowModel.query()
          .innerJoinRelated('licence')

        expect(query).toBeTruthy()
      })

      it('can eager load the licence', async () => {
        const result = await WorkflowModel.query()
          .findById(testRecord.chargeVersionWorkflowId)
          .withGraphFetched('licence')

        expect(result).toBeInstanceOf(WorkflowModel)
        expect(result.chargeVersionWorkflowId).toBe(testRecord.chargeVersionWorkflowId)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })
  })
})

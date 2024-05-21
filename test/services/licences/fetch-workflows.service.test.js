'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

const WorkflowHelper = require('../../support/helpers/workflow.helper.js')

// Thing under test
const FetchWorkflowsService =
  require('../../../app/services/licences/fetch-workflows.service.js')

describe('Fetch workflows for a licence', () => {
  let testRecord

  beforeEach(async () => {
    testRecord = await WorkflowHelper.add()

    await WorkflowHelper.add({
      deletedAt: new Date(),
      licenceId: testRecord.licenceId
    })
  })

  describe('when the licence has workflow data', () => {
    it('returns the matching workflow data', async () => {
      const result = await FetchWorkflowsService.go(testRecord.licenceId)

      expect(result).to.equal([
        {
          createdAt: testRecord.createdAt,
          data: {
            chargeVersion: null
          },
          id: testRecord.id,
          licenceId: testRecord.licenceId,
          status: 'to_setup'
        }]
      )
    })
  })
})

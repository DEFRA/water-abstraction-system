'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const WorkflowHelper = require('../../support/helpers/workflow.helper.js')

// Thing under test
const FetchWorkflowsService = require('../../../app/services/licences/fetch-workflows.service.js')

describe('Licences - Fetch Workflows service', () => {
  let workflow
  let additionalWorkflow

  before(async () => {
    workflow = await WorkflowHelper.add()

    additionalWorkflow = await WorkflowHelper.add({
      deletedAt: new Date(),
      licenceId: workflow.licenceId
    })
  })

  after(async () => {
    await additionalWorkflow.$query().delete()
    await workflow.$query().delete()
  })

  describe('when the licence has workflow data', () => {
    it('returns the matching workflow data', async () => {
      const result = await FetchWorkflowsService.go(workflow.licenceId)

      expect(result).to.equal([
        {
          createdAt: workflow.createdAt,
          data: {
            chargeVersion: null
          },
          id: workflow.id,
          licenceId: workflow.licenceId,
          status: 'to_setup'
        }
      ])
    })
  })
})

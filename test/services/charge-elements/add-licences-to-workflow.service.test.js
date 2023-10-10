'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const Workflow = require('../../../app/models/water/workflow.model.js')

// Things we need to stub
const FetchLicencesForWorkflowService = require('../../../app/services/charge-elements/fetch-licences-for-workflow.service.js')

// Thing under test
const AddLicencesToWorkflowService = require('../../../app/services/charge-elements/add-licences-to-workflow.service.js')

describe('Add Licences to Workflow service', () => {
  let notifierStub

  beforeEach(() => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(async () => {
    await DatabaseHelper.clean()
    Sinon.restore()
  })

  describe('when there are licences to add to the workflow', () => {
    const fetchedLicences = [
      {
        licenceId: generateUUID(),
        licenceVersionId: generateUUID()
      },
      {
        licenceId: generateUUID(),
        licenceVersionId: generateUUID()
      }
    ]

    beforeEach(() => {
      Sinon.stub(FetchLicencesForWorkflowService, 'go').returns(fetchedLicences)
    })

    it('adds the licences to the workflow table', async () => {
      await AddLicencesToWorkflowService.go()

      const result = await Workflow.query()
        .whereIn('licenceId', [fetchedLicences[0].licenceId, fetchedLicences[1].licenceId])

      expect(result).to.have.length(2)
      expect(result[0].status).to.equal('to_setup')
      expect(result[0].data).to.equal({ chargeVersion: null })
    })
  })

  describe('when there are NO licences to add to the workflow', () => {
    const fetchedLicences = []

    beforeEach(() => {
      Sinon.stub(FetchLicencesForWorkflowService, 'go').resolves(fetchedLicences)
    })

    it('does not error', async () => {
      await AddLicencesToWorkflowService.go()

      const args = notifierStub.omfg.firstCall?.args

      expect(args).to.be.undefined()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicencesForWorkflowService, 'go').throws()
    })

    it('handles the error', async () => {
      await AddLicencesToWorkflowService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('AddLicencesToWorkflowService failed to run')
      expect(args[1]).to.be.null()
      expect(args[2]).to.be.an.error()
    })
  })
})

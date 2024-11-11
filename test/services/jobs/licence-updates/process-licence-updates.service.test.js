'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const WorkflowModel = require('../../../../app/models/workflow.model.js')

// Things we need to stub
const FetchLicenceUpdatesService = require('../../../../app/services/jobs/licence-updates/fetch-licence-updates.service.js')

// Thing under test
const ProcessLicenceUpdatesService = require('../../../../app/services/jobs/licence-updates/process-licence-updates.js')

describe('Process Licence Updates service', () => {
  let fetchResults
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are licence updates', () => {
    beforeEach(() => {
      fetchResults = [
        {
          id: generateUUID(),
          licenceId: generateUUID(),
          chargeVersionExists: false
        },
        {
          id: generateUUID(),
          licenceId: generateUUID(),
          chargeVersionExists: true
        }
      ]

      Sinon.stub(FetchLicenceUpdatesService, 'go').resolves(fetchResults)
    })

    it('adds the updated licences to workflow', async () => {
      await ProcessLicenceUpdatesService.go()

      const results = await WorkflowModel.query()
        .whereIn('licenceId', [fetchResults[0].licenceId, fetchResults[1].licenceId])
        .orderBy('createdAt', 'asc')

      expect(results).to.have.length(2)

      expect(results[0].licenceVersionId).to.equal(fetchResults[0].id)
      expect(results[0].licenceId).to.equal(fetchResults[0].licenceId)
      expect(results[0].status).to.equal('to_setup')
      expect(results[0].data).to.equal({ chargeVersion: null, chargeVersionExists: false })

      expect(results[1].licenceVersionId).to.equal(fetchResults[1].id)
      expect(results[1].licenceId).to.equal(fetchResults[1].licenceId)
      expect(results[1].status).to.equal('to_setup')
      expect(results[1].data).to.equal({ chargeVersion: null, chargeVersionExists: true })
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessLicenceUpdatesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Licence updates job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.exist()
    })
  })

  describe('when there are no licence updates', () => {
    beforeEach(() => {
      fetchResults = []

      Sinon.stub(FetchLicenceUpdatesService, 'go').resolves(fetchResults)
    })

    it('adds nothing to workflow', async () => {
      const previousResults = await WorkflowModel.query().orderBy('createdAt', 'asc')

      await ProcessLicenceUpdatesService.go()

      const results = await WorkflowModel.query().orderBy('createdAt', 'asc')

      expect(results).to.equal(previousResults)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessLicenceUpdatesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Licence updates job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.exist()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceUpdatesService, 'go').rejects()
    })

    it('handles the error', async () => {
      await ProcessLicenceUpdatesService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Licence updates job failed')
      expect(args[1]).to.be.null()
      expect(args[2]).to.be.an.error()
    })
  })
})

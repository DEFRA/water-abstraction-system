'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const WorkflowModel = require('../../../../app/models/workflow.model.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchTimeLimitedLicencesService = require('../../../../app/services/jobs/time-limited/fetch-time-limited-licences.service.js')
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')

// Thing under test
const ProcessTimeLimitedLicencesService = require('../../../../app/services/jobs/time-limited/process-time-limited-licences.service.js')

describe('Process Time Limited Licences service', () => {
  let fetchResults
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  describe('when there are licences with time limited charge elements', () => {
    beforeEach(() => {
      fetchResults = [
        {
          id: generateUUID(),
          licenceVersionId: generateUUID(),
          chargeVersionId: generateUUID()
        },
        {
          id: generateUUID(),
          licenceVersionId: generateUUID(),
          chargeVersionId: generateUUID()
        }
      ]

      Sinon.stub(FetchTimeLimitedLicencesService, 'go').resolves(fetchResults)
    })

    it('adds the licences to the workflow table', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const results = await WorkflowModel.query()
        .whereIn('licenceId', [fetchResults[0].id, fetchResults[1].id])
        .orderBy('createdAt', 'asc')

      expect(results).toHaveLength(2)

      expect(results[0].licenceId).toEqual(fetchResults[0].id)
      expect(results[0].licenceVersionId).toEqual(fetchResults[0].licenceVersionId)
      expect(results[0].status).toEqual('to_setup')
      expect(results[0].data).toEqual({
        chargeVersion: null,
        timeLimitedChargeVersionId: fetchResults[0].chargeVersionId
      })

      expect(results[1].licenceId).toEqual(fetchResults[1].id)
      expect(results[1].licenceVersionId).toEqual(fetchResults[1].licenceVersionId)
      expect(results[1].status).toEqual('to_setup')
      expect(results[1].data).toEqual({
        chargeVersion: null,
        timeLimitedChargeVersionId: fetchResults[1].chargeVersionId
      })
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Time limited job complete')).toBe(true)
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toBeDefined()
    })
  })

  describe('when there are no time limited licences', () => {
    beforeEach(() => {
      fetchResults = []

      Sinon.stub(FetchTimeLimitedLicencesService, 'go').resolves(fetchResults)
    })

    it('adds nothing to workflow', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const results = await WorkflowModel.query()
        // Matches the fetched results for FetchTimeLimitedLicencesService
        .whereIn('licenceId', [])
        .orderBy('createdAt', 'asc')

      expect(results).toHaveLength(0)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Time limited job complete')).toBe(true)
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toBeDefined()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      Sinon.stub(FetchTimeLimitedLicencesService, 'go').rejects()
    })

    it('records the error by calling "omfg()"', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).toEqual('Time limited job failed')
      expect(args[1]).toBeNull()
      expect(args[2]).toBeInstanceOf(Error)
    })

    it('notifies the team by calling "redAlert()"', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const args = notifierStub.redAlert.firstCall.args

      expect(args[0]).toEqual('Time limited job failed')
    })

    it('does not throw an error', async () => {
      await ProcessTimeLimitedLicencesService.go()
    })
  })
})

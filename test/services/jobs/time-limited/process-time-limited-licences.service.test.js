// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import WorkflowModel from 'water-abstraction-engine/models/workflow.model.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import GlobalNotifierStub from 'water-abstraction-engine/test/stubs/global-notifier.stub.js'
import * as FetchTimeLimitedLicencesService from '../../../../src/services/jobs/time-limited/fetch-time-limited-licences.service.js'

// Thing under test
import ProcessTimeLimitedLicencesService from '../../../../src/services/jobs/time-limited/process-time-limited-licences.service.js'

describe('Process Time Limited Licences service', () => {
  let fetchResults
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in the GlobalNotifierPlugin
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

      vi.spyOn(FetchTimeLimitedLicencesService, 'default').mockResolvedValue(fetchResults)
    })

    it('adds the licences to the workflow table', async () => {
      await ProcessTimeLimitedLicencesService()

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
      await ProcessTimeLimitedLicencesService()

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Time limited job complete', expect.any(Object))
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toBeDefined()
    })
  })

  describe('when there are no time limited licences', () => {
    beforeEach(() => {
      fetchResults = []

      vi.spyOn(FetchTimeLimitedLicencesService, 'default').mockResolvedValue(fetchResults)
    })

    it('adds nothing to workflow', async () => {
      await ProcessTimeLimitedLicencesService()

      const results = await WorkflowModel.query()
        // Matches the fetched results for FetchTimeLimitedLicencesService
        .whereIn('licenceId', [])
        .orderBy('createdAt', 'asc')

      expect(results).toHaveLength(0)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessTimeLimitedLicencesService()

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Time limited job complete', expect.any(Object))
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toBeDefined()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      vi.spyOn(FetchTimeLimitedLicencesService, 'default').mockRejectedValue(new Error())
    })

    it('records the error by calling "omfg()"', async () => {
      await ProcessTimeLimitedLicencesService()

      const args = notifierStub.omfg.mock.calls[0]

      expect(args[0]).toEqual('Time limited job failed')
      expect(args[1]).toBeNull()
      expect(args[2]).toBeInstanceOf(Error)
    })

    it('notifies the team by calling "redAlert()"', async () => {
      await ProcessTimeLimitedLicencesService()

      const args = notifierStub.redAlert.mock.calls[0]

      expect(args[0]).toEqual('Time limited job failed')
    })

    it('does not throw an error', async () => {
      await ProcessTimeLimitedLicencesService()
    })
  })
})

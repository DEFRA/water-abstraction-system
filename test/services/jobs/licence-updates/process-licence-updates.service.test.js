// Test framework dependencies

// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'
import WorkflowModel from '../../../../app/models/workflow.model.js'

// Things we need to stub
import FetchLicenceUpdatesService from '../../../../app/services/jobs/licence-updates/fetch-licence-updates.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import ProcessLicenceUpdatesService from '../../../../app/services/jobs/licence-updates/process-licence-updates.service.js'

describe('Jobs - Licence Updates - Process Licence Updates service', () => {
  let fetchResults
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
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

      vi.mock('../../../../app/services/jobs/licence-updates/fetch-licence-updates.service.js')
      FetchLicenceUpdatesService.mockResolvedValue(fetchResults)
    })

    it('adds the updated licences to workflow', async () => {
      await ProcessLicenceUpdatesService()

      const results = await WorkflowModel.query()
        .whereIn('licenceId', [fetchResults[0].licenceId, fetchResults[1].licenceId])
        .orderBy('createdAt', 'asc')

      expect(results).toHaveLength(2)

      expect(results[0].licenceVersionId).toEqual(fetchResults[0].id)
      expect(results[0].licenceId).toEqual(fetchResults[0].licenceId)
      expect(results[0].status).toEqual('to_setup')
      expect(results[0].data).toEqual({ chargeVersion: null, chargeVersionExists: false })

      expect(results[1].licenceVersionId).toEqual(fetchResults[1].id)
      expect(results[1].licenceId).toEqual(fetchResults[1].licenceId)
      expect(results[1].status).toEqual('to_setup')
      expect(results[1].data).toEqual({ chargeVersion: null, chargeVersionExists: true })
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessLicenceUpdatesService()

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Licence updates job complete')
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toBeDefined()
    })
  })

  describe('when there are no licence updates', () => {
    beforeEach(() => {
      fetchResults = []

      vi.mock('../../../../app/services/jobs/licence-updates/fetch-licence-updates.service.js')
      FetchLicenceUpdatesService.mockResolvedValue(fetchResults)
    })

    it('adds nothing to workflow', async () => {
      const previousResults = await WorkflowModel.query().orderBy('createdAt', 'asc')

      await ProcessLicenceUpdatesService()

      const results = await WorkflowModel.query().orderBy('createdAt', 'asc')

      expect(results).toEqual(previousResults)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessLicenceUpdatesService()

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Licence updates job complete')
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toBeDefined()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      vi.mock('../../../../app/services/jobs/licence-updates/fetch-licence-updates.service.js')
      FetchLicenceUpdatesService.mockRejectedValue()
    })

    it('records the error by calling "omfg()"', async () => {
      await ProcessLicenceUpdatesService()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).toEqual('Licence updates job failed')
      expect(args[1]).toBeNull()
      expect(args[2]).toBeInstanceOf(Error)
    })

    it('notifies the team by calling "redAlert()"', async () => {
      await ProcessLicenceUpdatesService()

      const args = notifierStub.redAlert.firstCall.args

      expect(args[0]).toEqual('Licence updates job failed')
    })

    it('does not throw an error', async () => {
      await ProcessLicenceUpdatesService()
    })
  })
})

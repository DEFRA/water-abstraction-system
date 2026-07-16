// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as ReturnCyclesFixture from '../../../support/fixtures/return-cycles.fixture.js'
import * as ReturnRequirementsFixture from '../../../support/fixtures/return-requirements.fixture.js'

// Things we need to stub
import * as CheckReturnCycleService from '../../../../app/services/jobs/return-logs/check-return-cycle.service.js'
import * as CreateReturnLogsService from '../../../../app/services/return-logs/create-return-logs.service.js'
import * as FetchReturnRequirementsService from '../../../../app/services/jobs/return-logs/fetch-return-requirements.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import ProcessReturnLogsService from '../../../../app/services/jobs/return-logs/process-return-logs.service.js'

describe('Jobs - Return Logs - Process Return Logs service', () => {
  const cycle = 'all-year'
  let notifierStub
  let returnRequirement

  beforeEach(() => {
    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when the requested return cycle exists', () => {
    beforeEach(() => {
      vi.spyOn(CreateReturnLogsService, 'default').mockResolvedValue()

      vi.spyOn(CheckReturnCycleService, 'default').mockResolvedValue(ReturnCyclesFixture.winterCycle())
    })

    describe('and there are return requirements that need return logs created', () => {
      beforeEach(() => {
        returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
        vi.spyOn(FetchReturnRequirementsService, 'default').mockResolvedValue([returnRequirement])
      })

      it('logs the time taken in milliseconds and seconds', async () => {
        await ProcessReturnLogsService(cycle)

        const logDataArg = notifierStub.omg.mock.calls[0][1]

        expect(CreateReturnLogsService.default).toHaveBeenCalled()
        expect(notifierStub.omg).toHaveBeenCalledWith('Return logs job complete', expect.any(Object))
        expect(logDataArg.timeTakenMs).toBeDefined()
        expect(logDataArg.timeTakenSs).toBeDefined()
        expect(logDataArg.count).toEqual(1)
        expect(logDataArg.cycle).toEqual(cycle)
      })
    })

    describe('and it has a return version with an end date with return requirements that need return logs created', () => {
      beforeEach(() => {
        returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
        returnRequirement.returnVersion.endDate = '2023-05-28'
        vi.spyOn(FetchReturnRequirementsService, 'default').mockResolvedValue([returnRequirement])
      })

      it('logs the time taken in milliseconds and seconds', async () => {
        await ProcessReturnLogsService(cycle)

        const logDataArg = notifierStub.omg.mock.calls[0][1]

        expect(CreateReturnLogsService.default).toHaveBeenCalled()
        expect(notifierStub.omg).toHaveBeenCalledWith('Return logs job complete', expect.any(Object))
        expect(logDataArg.timeTakenMs).toBeDefined()
        expect(logDataArg.timeTakenSs).toBeDefined()
        expect(logDataArg.count).toEqual(1)
        expect(logDataArg.cycle).toEqual(cycle)
      })
    })

    describe('but there are no return requirements that need return logs created', () => {
      beforeEach(() => {
        vi.spyOn(FetchReturnRequirementsService, 'default').mockResolvedValue([])
      })

      it('still logs the time taken in milliseconds and seconds', async () => {
        await ProcessReturnLogsService(cycle)

        const logDataArg = notifierStub.omg.mock.calls[0][1]

        expect(notifierStub.omg).toHaveBeenCalledWith('Return logs job complete', expect.any(Object))
        expect(logDataArg.timeTakenMs).toBeDefined()
        expect(logDataArg.timeTakenSs).toBeDefined()
        expect(logDataArg.count).toEqual(0)
        expect(logDataArg.cycle).toEqual(cycle)
      })
    })
  })

  describe('when the service errors', () => {
    describe('because the check return cycle service errors', () => {
      beforeEach(() => {
        vi.spyOn(CheckReturnCycleService, 'default').mockRejectedValue(new Error())
      })

      it('records the error by calling "omfg()"', async () => {
        await ProcessReturnLogsService(cycle)

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Return logs job failed')
        expect(args[1]).toEqual({ cycle })
        expect(args[2]).toBeInstanceOf(Error)
      })

      it('notifies the team by calling "redAlert()"', async () => {
        await ProcessReturnLogsService(cycle)

        const args = notifierStub.redAlert.mock.calls[0]

        expect(args[0]).toEqual('Return logs job failed')
      })

      it('does not throw an error', async () => {
        await ProcessReturnLogsService()
      })
    })
    describe('because the create return logs service errors', () => {
      beforeEach(() => {
        returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
        vi.spyOn(FetchReturnRequirementsService, 'default').mockResolvedValue([returnRequirement])

        vi.spyOn(CreateReturnLogsService, 'default').mockRejectedValue(new Error())
      })

      it('records the error by calling "omfg()"', async () => {
        await ProcessReturnLogsService(cycle)

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Return logs creation errored')
        expect(args[1].returnRequirement).toEqual(returnRequirement)
        expect(args[2]).toBeInstanceOf(Error)
      })

      it('does not throw an error', async () => {
        await ProcessReturnLogsService()
      })
    })
  })
})

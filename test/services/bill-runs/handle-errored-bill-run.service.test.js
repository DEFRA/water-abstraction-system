// Test helpers
import * as BillRunHelper from '../../support/helpers/bill-run.helper.js'

// Things we need to stub
import GlobalNotifierStub from '../../support/stubs/global-notifier.stub.js'

// Thing under test
import HandleErroredBillRunService from '../../../app/services/bill-runs/handle-errored-bill-run.service.js'

describe('Handle Errored Bill Run service', () => {
  let billRun
  let notifierStub

  beforeEach(async () => {
    billRun = await BillRunHelper.add()

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

  describe('when the service is called successfully', () => {
    it('sets the bill run status to "error"', async () => {
      await HandleErroredBillRunService(billRun.id)

      const result = await billRun.$query()

      expect(result.status).toEqual('error')
    })

    describe('when no error code is passed', () => {
      it('does not set an error code', async () => {
        await HandleErroredBillRunService(billRun.id)

        const result = await billRun.$query()

        expect(result.errorCode).toBeNull()
      })
    })

    describe('when an error code is passed', () => {
      it('does set an error code', async () => {
        await HandleErroredBillRunService(billRun.id, 40)

        const result = await billRun.$query()

        expect(result.errorCode).toEqual(40)
      })
    })
  })

  describe('when the service is called unsuccessfully', () => {
    describe('because patching the bill run fails', () => {
      it('handles the error', async () => {
        await HandleErroredBillRunService(billRun.id, 'INVALID_ERROR_CODE')
      })

      it('logs an error', async () => {
        // Note that we would not normally pass a string as an error code but we do this here to force the patch to fail
        // in lieu of a working method of stubbing Objection
        await HandleErroredBillRunService(billRun.id, 'INVALID_ERROR_CODE')

        const logDataArg = notifierStub.omfg.mock.calls[0][1]

        expect(notifierStub.omfg).toHaveBeenCalledWith(
          'Failed to set error status on bill run',
          expect.any(Object),
          expect.any(Error)
        )
        expect(logDataArg.billRunId).toEqual(billRun.id)
        expect(logDataArg.errorCode).toEqual('INVALID_ERROR_CODE')
      })
    })
  })
})

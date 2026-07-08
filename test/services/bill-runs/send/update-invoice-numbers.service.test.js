// Test framework dependencies

import BillModel from '../../../../app/models/bill.model.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'
import ExpandedError from '../../../../app/errors/expanded.error.js'

// Things we need to stub
import * as ChargingModuleSendBillRunRequest from '../../../../app/requests/charging-module/send-bill-run.request.js'
import * as ChargingModuleViewBillRunRequest from '../../../../app/requests/charging-module/view-bill-run.request.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import UnflagBilledSupplementaryLicencesService from '../../../../app/services/bill-runs/unflag-billed-supplementary-licences.service.js'

// Thing under test
import UpdateInvoiceNumbersService from '../../../../app/services/bill-runs/send/update-invoice-numbers.service.js'

describe('Bill Runs - Send - Update Invoice Numbers service', () => {
  let billRun
  let chargingModuleSendBillRunRequestStub
  let chargingModuleViewBillRunRequestStub
  let notifierStub
  let billPatchStub
  let billRunPatchStub

  beforeEach(async () => {
    chargingModuleSendBillRunRequestStub = vi
      .spyOn(ChargingModuleSendBillRunRequest, 'send')
      .mockImplementation(() => {})
    chargingModuleViewBillRunRequestStub = vi
      .spyOn(ChargingModuleViewBillRunRequest, 'send')
      .mockImplementation(() => {})
    vi.mock('../../../../app/services/bill-runs/unflag-billed-supplementary-licences.service.js')
    UnflagBilledSupplementaryLicencesService.mockResolvedValue()

    billPatchStub = vi.fn().mockResolvedValue()
    billRunPatchStub = vi.fn().mockResolvedValue()

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

  describe('when the bill run exists', () => {
    describe('and no errors are thrown', () => {
      beforeEach(async () => {
        billRun = _billRun()

        chargingModuleSendBillRunRequestStub.mockResolvedValue()
        chargingModuleViewBillRunRequestStub.mockResolvedValue({
          succeeded: true,
          response: {
            body: {
              billRun: {
                invoices: [
                  { id: '5cd23bed-efc3-4507-af1c-7009e3e4a69c', transactionReference: 'WAI1000429' },
                  { id: 'f7b4bbc1-bbac-41ec-ab3b-707a5315bac1', transactionReference: 'WAI1000428' }
                ],
                transactionFileReference: 'nalwi50031'
              }
            }
          }
        })

        vi.spyOn(BillModel, 'query').mockReturnValue({
          patch: billPatchStub.returnsThis(),
          where: vi.fn().mockResolvedValue()
        })

        vi.spyOn(BillRunModel, 'query').mockReturnValue({
          findById: vi.fn().mockReturnThis(),
          patch: billRunPatchStub
        })
      })

      it('sends a request to the Charging Module API to send its copy', async () => {
        await UpdateInvoiceNumbersService(billRun)

        expect(chargingModuleSendBillRunRequestStub).toHaveBeenCalled()
      })

      it('requests a copy of the bill run from the Charging Module API with its generated invoice numbers', async () => {
        await UpdateInvoiceNumbersService(billRun)

        expect(chargingModuleViewBillRunRequestStub).toHaveBeenCalled()
      })

      it('updates the bills with the Charging Module invoice numbers', async () => {
        await UpdateInvoiceNumbersService(billRun)

        expect(billPatchStub.calledTwice).toBe(true)
        expect(billPatchStub.firstCall.firstArg).toEqual({ invoiceNumber: 'WAI1000429' })
        expect(billPatchStub.secondCall.firstArg).toEqual({ invoiceNumber: 'WAI1000428' })
      })

      it('updates the bill run with the Charging Module transaction reference', async () => {
        await UpdateInvoiceNumbersService(billRun)

        expect(billRunPatchStub).toHaveBeenCalledOnce()
        expect(billRunPatchStub.firstCall.firstArg).toMatchObject({
          status: 'sent',
          transactionFileReference: 'nalwi50031'
        })
      })

      it('logs a "complete" message, the bill run passed in, and the time taken in milliseconds and seconds', async () => {
        await UpdateInvoiceNumbersService(billRun)

        const logDataArg = notifierStub.omg.mock.calls[0][1]

        expect(notifierStub.omg).toHaveBeenCalledWith('Send bill run complete')
        expect(logDataArg.timeTakenMs).toBeDefined()
        expect(logDataArg.timeTakenSs).toBeDefined()
        expect(logDataArg.billRun).toEqual(billRun)
      })

      describe('and if the bill run is supplementary', () => {
        beforeEach(async () => {
          billRun.batchType = 'supplementary'
        })

        it('also unflags the licences for supplementary billing', async () => {
          await UpdateInvoiceNumbersService(billRun)

          expect(UnflagBilledSupplementaryLicencesService).toHaveBeenCalled()
        })
      })

      describe('and if the bill run is two-part supplementary', () => {
        beforeEach(async () => {
          billRun.batchType = 'two_part_supplementary'
        })

        it('also unflags the licences for supplementary billing', async () => {
          await UpdateInvoiceNumbersService(billRun)

          expect(UnflagBilledSupplementaryLicencesService).toHaveBeenCalled()
        })
      })

      describe('and if the bill run is neither supplementary or two-part supplementary', () => {
        it('leaves the licences supplementary billing flags alone', async () => {
          await UpdateInvoiceNumbersService(billRun)

          expect(UnflagBilledSupplementaryLicencesService).not.toHaveBeenCalled()
        })
      })
    })

    describe('but an error is thrown', () => {
      describe('outside of the delete calls', () => {
        beforeEach(() => {
          billRun = null
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg).toHaveBeenCalledWith('Send bill run failed')
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })

      describe('when making the send request to the Charging Module API', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleSendBillRunRequestStub.mockRejectedValue(new ExpandedError('Charging Module send request failed', {}))
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg).toHaveBeenCalledWith('Send bill run failed')
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(ExpandedError)
        })
      })

      describe('when making the view request to the Charging Module API', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleSendBillRunRequestStub.mockResolvedValue()
          chargingModuleViewBillRunRequestStub.mockResolvedValue({ result: { succeeded: false } })
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg).toHaveBeenCalledWith('Send bill run failed')
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(ExpandedError)
        })
      })

      describe('when updating the bills errors', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleSendBillRunRequestStub.mockResolvedValue()
          chargingModuleViewBillRunRequestStub.mockResolvedValue()

          vi.spyOn(BillModel, 'query').mockReturnValue({
            patch: vi.fn().mockReturnThis(),
            where: vi.fn().rejects()
          })
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg).toHaveBeenCalledWith('Send bill run failed')
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })

      describe('when updating the bill run errors', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleSendBillRunRequestStub.mockResolvedValue()
          chargingModuleViewBillRunRequestStub.mockResolvedValue()

          vi.spyOn(BillModel, 'query').mockReturnValue({
            patch: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue()
          })
          vi.spyOn(BillRunModel, 'query').mockReturnValue({
            findById: vi.fn().mockReturnThis(),
            patch: vi.fn().rejects()
          })
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg).toHaveBeenCalledWith('Send bill run failed')
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })
    })
  })
})

function _billRun() {
  return {
    batchType: 'annual',
    createdAt: new Date('2024-05-07'),
    externalId: 'c5d64590-a0c9-45ee-b381-ab1ddb569751',
    id: '20f530db-aa69-42d1-8a27-0ab838ca1916',
    scheme: 'sroc',
    status: 'ready'
  }
}

'use strict'

// Test framework dependencies
const Sinon = require('sinon')

const BillModel = require('../../../../app/models/bill.model.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ExpandedError = require('../../../../app/errors/expanded.error.js')

// Things we need to stub
const ChargingModuleSendBillRunRequest = require('../../../../app/requests/charging-module/send-bill-run.request.js')
const ChargingModuleViewBillRunRequest = require('../../../../app/requests/charging-module/view-bill-run.request.js')
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')
const UnflagBilledSupplementaryLicencesService = require('../../../../app/services/bill-runs/unflag-billed-supplementary-licences.service.js')

// Thing under test
const UpdateInvoiceNumbersService = require('../../../../app/services/bill-runs/send/update-invoice-numbers.service.js')

describe('Bill Runs - Send - Update Invoice Numbers service', () => {
  let billRun
  let chargingModuleSendBillRunRequestStub
  let chargingModuleViewBillRunRequestStub
  let notifierStub
  let unflagBilledLicencesServiceStub

  let billPatchStub
  let billRunPatchStub

  beforeEach(async () => {
    chargingModuleSendBillRunRequestStub = Sinon.stub(ChargingModuleSendBillRunRequest, 'send')
    chargingModuleViewBillRunRequestStub = Sinon.stub(ChargingModuleViewBillRunRequest, 'send')
    unflagBilledLicencesServiceStub = Sinon.stub(UnflagBilledSupplementaryLicencesService, 'go').resolves()

    billPatchStub = Sinon.stub().resolves()
    billRunPatchStub = Sinon.stub().resolves()

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

  describe('when the bill run exists', () => {
    describe('and no errors are thrown', () => {
      beforeEach(async () => {
        billRun = _billRun()

        chargingModuleSendBillRunRequestStub.resolves()
        chargingModuleViewBillRunRequestStub.resolves({
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

        Sinon.stub(BillModel, 'query').returns({
          patch: billPatchStub.returnsThis(),
          where: Sinon.stub().resolves()
        })

        Sinon.stub(BillRunModel, 'query').returns({
          findById: Sinon.stub().withArgs('20f530db-aa69-42d1-8a27-0ab838ca1916').returnsThis(),
          patch: billRunPatchStub
        })
      })

      it('sends a request to the Charging Module API to send its copy', async () => {
        await UpdateInvoiceNumbersService(billRun)

        expect(chargingModuleSendBillRunRequestStub.called).toBe(true)
      })

      it('requests a copy of the bill run from the Charging Module API with its generated invoice numbers', async () => {
        await UpdateInvoiceNumbersService(billRun)

        expect(chargingModuleViewBillRunRequestStub.called).toBe(true)
      })

      it('updates the bills with the Charging Module invoice numbers', async () => {
        await UpdateInvoiceNumbersService(billRun)

        expect(billPatchStub.calledTwice).toBe(true)
        expect(billPatchStub.firstCall.firstArg).toEqual({ invoiceNumber: 'WAI1000429' })
        expect(billPatchStub.secondCall.firstArg).toEqual({ invoiceNumber: 'WAI1000428' })
      })

      it('updates the bill run with the Charging Module transaction reference', async () => {
        await UpdateInvoiceNumbersService(billRun)

        expect(billRunPatchStub.calledOnce).toBe(true)
        expect(billRunPatchStub.firstCall.firstArg).toMatchObject({
          status: 'sent',
          transactionFileReference: 'nalwi50031'
        })
      })

      it('logs a "complete" message, the bill run passed in, and the time taken in milliseconds and seconds', async () => {
        await UpdateInvoiceNumbersService(billRun)

        const logDataArg = notifierStub.omg.args[0][1]

        expect(notifierStub.omg.calledWith('Send bill run complete')).toBe(true)
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

          expect(unflagBilledLicencesServiceStub.called).toBe(true)
        })
      })

      describe('and if the bill run is two-part supplementary', () => {
        beforeEach(async () => {
          billRun.batchType = 'two_part_supplementary'
        })

        it('also unflags the licences for supplementary billing', async () => {
          await UpdateInvoiceNumbersService(billRun)

          expect(unflagBilledLicencesServiceStub.called).toBe(true)
        })
      })

      describe('and if the bill run is neither supplementary or two-part supplementary', () => {
        it('leaves the licences supplementary billing flags alone', async () => {
          await UpdateInvoiceNumbersService(billRun)

          expect(unflagBilledLicencesServiceStub.called).toBe(false)
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

          expect(notifierStub.omfg.calledWith('Send bill run failed')).toBe(true)
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })

      describe('when making the send request to the Charging Module API', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleSendBillRunRequestStub.rejects(new ExpandedError('Charging Module send request failed', {}))
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg.calledWith('Send bill run failed')).toBe(true)
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(ExpandedError)
        })
      })

      describe('when making the view request to the Charging Module API', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleSendBillRunRequestStub.resolves()
          chargingModuleViewBillRunRequestStub.resolves({ result: { succeeded: false } })
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg.calledWith('Send bill run failed')).toBe(true)
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(ExpandedError)
        })
      })

      describe('when updating the bills errors', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleSendBillRunRequestStub.resolves()
          chargingModuleViewBillRunRequestStub.resolves()

          Sinon.stub(BillModel, 'query').returns({
            patch: Sinon.stub().returnsThis(),
            where: Sinon.stub().rejects()
          })
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg.calledWith('Send bill run failed')).toBe(true)
          expect(errorLogArgs[1]).toEqual(billRun)
          expect(errorLogArgs[2]).toBeInstanceOf(Error)
        })
      })

      describe('when updating the bill run errors', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleSendBillRunRequestStub.resolves()
          chargingModuleViewBillRunRequestStub.resolves()

          Sinon.stub(BillModel, 'query').returns({
            patch: Sinon.stub().returnsThis(),
            where: Sinon.stub().resolves()
          })
          Sinon.stub(BillRunModel, 'query').returns({
            findById: Sinon.stub().returnsThis(),
            patch: Sinon.stub().rejects()
          })
        })

        it('does not throw an error', async () => {
          await UpdateInvoiceNumbersService(billRun)
        })

        it('logs the error', async () => {
          await UpdateInvoiceNumbersService(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(notifierStub.omfg.calledWith('Send bill run failed')).toBe(true)
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

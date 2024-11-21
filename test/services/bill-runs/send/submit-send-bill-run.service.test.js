'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { setTimeout } = require('timers/promises')

const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ExpandedError = require('../../../../app/errors/expanded.error.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const ChargingModuleSendBillRunRequest = require('../../../../app/requests/charging-module/send-bill-run.request.js')
const ChargingModuleViewBillRunRequest = require('../../../../app/requests/charging-module/view-bill-run.request.js')
const UnflagBilledLicencesService = require('../../../../app/services/bill-runs/supplementary/unflag-billed-licences.service.js')

// Thing under test
const SubmitSendBillBunService = require('../../../../app/services/bill-runs/send/submit-send-bill-run.service.js')

describe('Submit Send Bill Run service', () => {
  // NOTE: introducing a delay in the tests is not ideal. But the service is written such that the send happens in the
  // background and is not awaited. We want to confirm things like the records have been updated. But the only way to do
  // so is to give the background process time to complete.
  const delay = 500

  let chargingModuleSendBillRunRequestStub
  let chargingModuleViewBillRunRequestStub
  let notifierStub
  let unflagBilledLicencesServiceStub

  beforeEach(async () => {
    chargingModuleSendBillRunRequestStub = Sinon.stub(ChargingModuleSendBillRunRequest, 'send').resolves()
    chargingModuleViewBillRunRequestStub = Sinon.stub(ChargingModuleViewBillRunRequest, 'send')
    unflagBilledLicencesServiceStub = Sinon.stub(UnflagBilledLicencesService, 'go').resolves()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the bill run exists', () => {
    let firstBill
    let secondBill
    let billRun

    describe('and its status is "ready"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ externalId: generateUUID(), status: 'ready' })
      })

      describe('and the /send request to the Charging Module API succeeds', () => {
        beforeEach(async () => {
          firstBill = await BillHelper.add({ externalId: generateUUID() })
          secondBill = await BillHelper.add({ externalId: generateUUID() })

          chargingModuleViewBillRunRequestStub.resolves({
            succeeded: true,
            response: {
              body: {
                billRun: {
                  invoices: [
                    { id: firstBill.externalId, transactionReference: 'WAI1000429' },
                    { id: secondBill.externalId, transactionReference: 'WAI1000428' }
                  ],
                  transactionFileReference: 'nalwi50031'
                }
              }
            }
          })
        })

        it('sends a request to the Charging Module API to send its copy', async () => {
          await SubmitSendBillBunService.go(billRun.id)

          expect(chargingModuleSendBillRunRequestStub.called).to.be.true()
        })

        it('updates the bill run with the Charging Module transaction file reference', async () => {
          await SubmitSendBillBunService.go(billRun.id)

          await setTimeout(delay)

          const refreshedBillRun = await billRun.$query()

          expect(refreshedBillRun.transactionFileReference).to.equal('nalwi50031')
        })

        it('updates the bills with the Charging Module invoice numbers', async () => {
          await SubmitSendBillBunService.go(billRun.id)

          await setTimeout(delay)

          const refreshedFirstBill = await firstBill.$query()

          expect(refreshedFirstBill.invoiceNumber).to.equal('WAI1000429')

          const refreshedSecondBill = await secondBill.$query()

          expect(refreshedSecondBill.invoiceNumber).to.equal('WAI1000428')
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await SubmitSendBillBunService.go(billRun.id)

          await setTimeout(delay)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(
            notifierStub.omg.calledWith('Send bill run complete')
          ).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.billRunId).to.exist()
        })

        describe('when the bill run batch type is "supplementary"', () => {
          it('removes the SROC supplementary billing flag from those licences billed', async () => {
            await SubmitSendBillBunService.go(billRun.id)

            await setTimeout(delay)

            expect(unflagBilledLicencesServiceStub.called).to.be.true()
          })
        })

        describe('when the bill run batch type is not "supplementary"', () => {
          let annualBillRun

          beforeEach(async () => {
            annualBillRun = await BillRunHelper.add({
              batchType: 'annual', externalId: '76ed78bd-c104-4ad7-8842-4b660df02331', status: 'ready'
            })
          })

          it('leaves the SROC supplementary billing flag for those licences billed', async () => {
            await SubmitSendBillBunService.go(annualBillRun.id)

            await setTimeout(delay)

            expect(unflagBilledLicencesServiceStub.called).to.be.false()
          })
        })
      })

      describe('but the request to view the Charging Module bill run fails', () => {
        beforeEach(() => {
          chargingModuleViewBillRunRequestStub.resolves({
            succeeded: false,
            response: new Error('CHA go pop')
          })
        })

        it('logs an error', async () => {
          await SubmitSendBillBunService.go(billRun.id)

          await setTimeout(delay)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(
            notifierStub.omfg.calledWith('Charging Module view bill run request failed')
          ).to.be.true()
          expect(errorLogArgs[1].billRunId).to.exist()
          expect(errorLogArgs[2]).to.be.instanceOf(ExpandedError)
          expect(errorLogArgs[2].billRunExternalId).to.equal(billRun.externalId)
        })
      })
    })

    describe('but its status is not "ready"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ status: 'sent' })
      })

      it('throws as error', async () => {
        const result = await expect(SubmitSendBillBunService.go(billRun.id))
          .to
          .reject()

        expect(result).to.be.instanceOf(ExpandedError)
        expect(result.message).to.equal('Cannot send a bill run that is not ready')
        expect(result.billRunId).to.equal(billRun.id)
      })
    })
  })

  describe('when the bill run does not exist', () => {
    it('throws an error', async () => {
      await expect(SubmitSendBillBunService.go('testId'))
        .to
        .reject()
    })
  })
})

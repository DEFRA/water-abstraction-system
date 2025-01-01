'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { setTimeout } = require('timers/promises')

// Things we need to stub
const SendBillRunService = require('../../../../app/services/bill-runs/send/send-bill-run.service.js')
const UpdateInvoiceNumbersService = require('../../../../app/services/bill-runs/send/update-invoice-numbers.service.js')

// Thing under test
const SubmitSendBillRunService = require('../../../../app/services/bill-runs/send/submit-send-bill-run.service.js')

describe('Bill Runs - Submit Cancel Bill Run service', () => {
  const billRunId = '800b8ff7-80e6-4855-a394-c79550115265'

  let sendBillRunStub
  let updateDoneFake
  let updateInvoiceNumbersStub

  beforeEach(async () => {
    sendBillRunStub = Sinon.stub(SendBillRunService, 'go')
    updateDoneFake = Sinon.fake()
    updateInvoiceNumbersStub = Sinon.stub(UpdateInvoiceNumbersService, 'go').callsFake(async () => {
      await setTimeout(500)
      updateDoneFake()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the SendBillRunService succeeds', () => {
      beforeEach(() => {
        const billRun = _billRun()

        sendBillRunStub.resolves(billRun)
      })

      it('updates the bill run invoice numbers in the background and does not throw an error', async () => {
        await SubmitSendBillRunService.go(billRunId)

        expect(sendBillRunStub.called).to.be.true()
        expect(updateInvoiceNumbersStub.called).to.be.true()

        // NOTE: We have faked the UpdateInvoiceNumbersService taking some time to complete so we can test that
        // SubmitSendBillRunService returns control back to us whilst the update is still in progress. We then pause and
        // allow the delete to complete to confirm that it was running in the background.
        expect(updateDoneFake.called).to.be.false()

        await setTimeout(500)

        expect(updateDoneFake.called).to.be.true()
      })
    })

    // NOTE: We are only testing what happens when SendBillRunService fails because it contains no error handling
    // whereas UpdateInvoiceNumbersService has been written to ensure _no_ errors are thrown. If we were to stub it and
    // force a rejection it would not represent anything that would ever happen in the app.
    describe('and the CancelBillRunService fails', () => {
      beforeEach(() => {
        sendBillRunStub.rejects()
      })

      it('does not update the bill run and throws an error', async () => {
        await expect(SubmitSendBillRunService.go(billRunId)).to.reject()

        expect(updateInvoiceNumbersStub.called).to.equal(false)
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
    status: 'sending'
  }
}

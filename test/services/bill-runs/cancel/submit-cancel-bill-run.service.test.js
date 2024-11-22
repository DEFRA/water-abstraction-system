'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { setTimeout } = require('timers/promises')

// Things we need to stub
const CancelBillRunService = require('../../../../app/services/bill-runs/cancel/cancel-bill-run.service.js')
const DeleteBillRunService = require('../../../../app/services/bill-runs/cancel/delete-bill-run.service.js')

// Thing under test
const SubmitCancelBillBunService = require('../../../../app/services/bill-runs/cancel/submit-cancel-bill-run.service.js')

describe('Bill Runs - Submit Cancel Bill Run service', () => {
  const billRunId = '800b8ff7-80e6-4855-a394-c79550115265'

  let cancelBillRunStub
  let deleteBillRunStub
  let deleteDoneFake

  beforeEach(async () => {
    cancelBillRunStub = Sinon.stub(CancelBillRunService, 'go')
    deleteDoneFake = Sinon.fake()
    deleteBillRunStub = Sinon.stub(DeleteBillRunService, 'go').callsFake(async () => {
      await setTimeout(500)
      deleteDoneFake()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the CancelBillRunService succeeds', () => {
      beforeEach(() => {
        const billRun = { id: billRunId, externalId: '917aaad6-1e7b-4848-8713-1fe1d9fc1e30', status: 'cancel' }

        cancelBillRunStub.resolves(billRun)
      })

      it('deletes the bill run in the background and does not throw an error', async () => {
        await SubmitCancelBillBunService.go(billRunId)

        expect(cancelBillRunStub.called).to.be.true()
        expect(deleteBillRunStub.called).to.be.true()

        // NOTE: We have faked the DeleteBillRunService taking some time to complete so we can test that
        // SubmitCancelBillBunService returns control back to us whilst the delete is still in progress. We then pause
        // and allow the delete to complete to confirm that it was running in the background.
        expect(deleteDoneFake.called).to.be.false()

        await setTimeout(500)

        expect(deleteDoneFake.called).to.be.true()
      })
    })

    // NOTE: We are only testing what happens when CancelBillRunService fails because it contains no error handling
    // whereas DeleteBillRunService has been written to ensure _no_ errors are thrown. If we were to stub it and force
    // a rejection it would not represent anything that would ever happen in the app.
    describe('and the CancelBillRunService fails', () => {
      beforeEach(() => {
        cancelBillRunStub.rejects()
      })

      it('does not delete the bill run and throws an error', async () => {
        await expect(SubmitCancelBillBunService.go(billRunId)).to.reject()

        expect(deleteBillRunStub.called).to.equal(false)
      })
    })
  })
})

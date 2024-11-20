'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunChargeVersionYearHelper = require('../../../support/helpers/bill-run-charge-version-year.helper.js')
const BillRunVolumeHelper = require('../../../support/helpers/bill-run-volume.helper.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementReturnHelper = require('../../../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')
const ReviewReturnHelper = require('../../../support/helpers/review-return.helper.js')
const TransactionHelper = require('../../../support/helpers/transaction.helper.js')

// Things we need to stub
const BillLicenceModel = require('../../../../app/models/bill-licence.model.js')
const ChargingModuleDeleteBillRunRequest = require('../../../../app/requests/charging-module/delete-bill-run.request.js')
const ReviewLicenceModel = require('../../../../app/models/review-licence.model.js')

// Thing under test
const DeleteBillBunService = require('../../../../app/services/bill-runs/cancel/delete-bill-run.service.js')

describe('Bill Runs - Delete Bill Run service', () => {
  let billRun
  let chargingModuleDeleteBillRunRequestStub
  let notifierStub

  beforeEach(() => {
    chargingModuleDeleteBillRunRequestStub = Sinon.stub(ChargingModuleDeleteBillRunRequest, 'send')

    // The service depends on GlobalNotifier to have been set. This happens in
    // app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered. As we're not
    // creating an instance of Hapi server in this test we recreate the condition by setting it directly with our
    // own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the bill run exists', () => {
    let bill
    let billLicence
    let billRunChargeVersionYear
    let billRunVolume
    let seededBillRun
    let transaction

    describe('and no errors are thrown', () => {
      beforeEach(async () => {
        seededBillRun = await BillRunHelper.add({ status: 'cancel' })

        billRun = { id: seededBillRun.id, externalId: seededBillRun.externalId, status: seededBillRun.status }

        // Add billing data
        billRunChargeVersionYear = await BillRunChargeVersionYearHelper.add({ billRunId: billRun.id })
        billRunVolume = await BillRunVolumeHelper.add({ billRunId: billRun.id })
        bill = await BillHelper.add({ billRunId: billRun.id })

        billLicence = await BillLicenceHelper.add({ billId: bill.id })
        transaction = await TransactionHelper.add({ billLicenceId: billLicence.id })

        chargingModuleDeleteBillRunRequestStub.resolves()
      })

      it('sends a request to the Charging Module API to delete its copy', async () => {
        await DeleteBillBunService.go(billRun)

        expect(chargingModuleDeleteBillRunRequestStub.called).to.be.true()
      })

      it('deletes any billing data data', async () => {
        await DeleteBillBunService.go(billRun)

        const billRunChargeVersionYearCount = await billRunChargeVersionYear.$query().select('id').resultSize()
        const billRunVolumeCount = await billRunVolume.$query().select('id').resultSize()
        const transactionCount = await transaction.$query().select('id').resultSize()
        const billLicenceCount = await billLicence.$query().select('id').resultSize()
        const billCount = await bill.$query().select('id').resultSize()
        const billRunCount = await seededBillRun.$query().select('id').resultSize()

        expect(billRunChargeVersionYearCount).to.equal(0)
        expect(billRunVolumeCount).to.equal(0)
        expect(transactionCount).to.equal(0)
        expect(billLicenceCount).to.equal(0)
        expect(billCount).to.equal(0)
        expect(billRunCount).to.equal(0)
      })

      it('logs a "complete" message, the bill run passed in, and the time taken in milliseconds and seconds', async () => {
        await DeleteBillBunService.go(billRun)

        const logDataArg = notifierStub.omg.args[0][1]

        expect(
          notifierStub.omg.calledWith('Delete bill run complete')
        ).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.timeTakenSs).to.exist()
        expect(logDataArg.billRun).to.equal(billRun)
      })

      describe('and the bill run has two-part tariff review data', () => {
        let reviewChargeElement
        let reviewChargeElementReturn
        let reviewChargeReference
        let reviewChargeVersion
        let reviewLicence
        let reviewReturn

        beforeEach(async () => {
          // Add two-part tariff review data
          reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id })
          reviewReturn = await ReviewReturnHelper.add({ reviewLicenceId: reviewLicence.id })
          reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId: reviewLicence.id })
          reviewChargeReference = await ReviewChargeReferenceHelper.add({
            reviewChargeVersionId: reviewChargeVersion.id
          })
          reviewChargeElement = await ReviewChargeElementHelper.add({
            reviewChargeReferenceId: reviewChargeReference.id
          })
          reviewChargeElementReturn = await ReviewChargeElementReturnHelper.add({
            reviewChargeElementId: reviewChargeElement.id,
            reviewReturnId: reviewReturn.id
          })
        })

        it('deletes any two-part tariff review data', async () => {
          await DeleteBillBunService.go(billRun)

          const reviewChargeElementCount = await reviewChargeElement.$query().select('id').resultSize()
          const reviewChargeElementReturnCount = await reviewChargeElementReturn.$query().select('id').resultSize()
          const reviewChargeReferenceCount = await reviewChargeReference.$query().select('id').resultSize()
          const reviewChargeVersionCount = await reviewChargeVersion.$query().select('id').resultSize()
          const reviewLicenceCount = await reviewLicence.$query().select('id').resultSize()
          const reviewReturnCount = await reviewReturn.$query().select('id').resultSize()

          expect(reviewChargeElementCount).to.equal(0)
          expect(reviewChargeElementReturnCount).to.equal(0)
          expect(reviewChargeReferenceCount).to.equal(0)
          expect(reviewChargeVersionCount).to.equal(0)
          expect(reviewLicenceCount).to.equal(0)
          expect(reviewReturnCount).to.equal(0)
        })
      })
    })

    describe('but an error is thrown', () => {
      describe('outside of the delete calls', () => {
        beforeEach(() => {
          billRun = null
        })

        it('does not throw an error', async () => {
          await expect(DeleteBillBunService.go(billRun)).not.to.reject()
        })

        it('logs the error', async () => {
          await DeleteBillBunService.go(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(
            notifierStub.omfg.calledWith('Delete bill run failed')
          ).to.be.true()
          expect(errorLogArgs[1]).to.equal(billRun)
          expect(errorLogArgs[2]).to.be.instanceOf(Error)
        })
      })

      describe('when making the request to the Charging Module API', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleDeleteBillRunRequestStub.rejects()
        })

        it('does not throw an error', async () => {
          await expect(DeleteBillBunService.go(billRun)).not.to.reject()
        })

        it('logs the error', async () => {
          await DeleteBillBunService.go(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(
            notifierStub.omfg.calledWith('Delete bill run failed')
          ).to.be.true()
          expect(errorLogArgs[1]).to.equal(billRun)
          expect(errorLogArgs[2]).to.be.instanceOf(Error)
        })
      })

      describe('when deleting the billing data', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleDeleteBillRunRequestStub.resolves()
          Sinon.stub(BillLicenceModel, 'query').returns({
            delete: Sinon.stub().returnsThis(),
            whereExists: Sinon.stub().rejects()
          })
        })

        it('does not throw an error', async () => {
          await expect(DeleteBillBunService.go(billRun)).not.to.reject()
        })

        it('logs the error', async () => {
          await DeleteBillBunService.go(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(
            notifierStub.omfg.calledWith('Failed to remove billing records')
          ).to.be.true()
          expect(errorLogArgs[1]).to.equal({ billRunId: billRun.id })
          expect(errorLogArgs[2]).to.be.instanceOf(Error)
        })
      })

      describe('when deleting the two-part tariff review data', () => {
        beforeEach(async () => {
          billRun = _billRun()

          chargingModuleDeleteBillRunRequestStub.resolves()
          Sinon.stub(ReviewLicenceModel, 'query').returns({
            delete: Sinon.stub().returnsThis(),
            where: Sinon.stub().rejects()
          })
        })

        it('does not throw an error', async () => {
          await expect(DeleteBillBunService.go(billRun)).not.to.reject()
        })

        it('logs the error', async () => {
          await DeleteBillBunService.go(billRun)

          const errorLogArgs = notifierStub.omfg.firstCall.args

          expect(
            notifierStub.omfg.calledWith('Failed to remove review results')
          ).to.be.true()
          expect(errorLogArgs[1]).to.equal({ billRunId: billRun.id })
          expect(errorLogArgs[2]).to.be.instanceOf(Error)
        })
      })
    })
  })

  describe('when the bill run does not exist', () => {
    beforeEach(() => {
      billRun = _billRun()
    })

    it('still sends a request to the Charging Module API', async () => {
      await DeleteBillBunService.go(billRun)

      expect(chargingModuleDeleteBillRunRequestStub.called).to.be.true()
    })

    it('still logs a "complete" message, the bill run passed in, and the time taken in milliseconds and seconds', async () => {
      await DeleteBillBunService.go(billRun)

      const logDataArg = notifierStub.omg.args[0][1]

      expect(
        notifierStub.omg.calledWith('Delete bill run complete')
      ).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.billRun).to.equal(billRun)
    })

    it('does not throw an error', async () => {
      await expect(DeleteBillBunService.go(billRun)).not.to.reject()
    })
  })
})

function _billRun () {
  return {
    id: 'dafe5048-24b1-485a-8289-2e584bb7ba68',
    externalId: 'ef6a17f2-412f-4502-a73d-b74c8b92ff19',
    status: 'cancel'
  }
}

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { setTimeout } = require('timers/promises')

const BillHelper = require('../../support/helpers/bill.helper.js')
const BillModel = require('../../../app/models/bill.model.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillLicenceModel = require('../../../app/models/bill-licence.model.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')
const BillRunChargeVersionYearHelper = require('../../support/helpers/bill-run-charge-version-year.helper.js')
const BillRunChargeVersionYearModel = require('../../../app/models/bill-run-charge-version-year.model.js')
const BillRunVolumeHelper = require('../../support/helpers/bill-run-volume.helper.js')
const BillRunVolumeModel = require('../../../app/models/bill-run-volume.model.js')
const DatabaseSupport = require('../../support/database.js')
const ReviewChargeElementHelper = require('../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../../app/models/review-charge-element.model.js')
const ReviewChargeElementReturnHelper = require('../../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeElementReturnModel = require('../../../app/models/review-charge-element-return.model.js')
const ReviewChargeReferenceHelper = require('../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeReferenceModel = require('../../../app/models/review-charge-reference.model.js')
const ReviewChargeVersionHelper = require('../../support/helpers/review-charge-version.helper.js')
const ReviewChargeVersionModel = require('../../../app/models/review-charge-version.model.js')
const ReviewLicenceHelper = require('../../support/helpers/review-licence.helper.js')
const ReviewLicenceModel = require('../../../app/models/review-licence.model.js')
const ReviewReturnHelper = require('../../support/helpers/review-return.helper.js')
const ReviewReturnModel = require('../../../app/models/review-return.model.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')
const TransactionModel = require('../../../app/models/transaction.model.js')

// Things we need to stub
const ChargingModuleDeleteBillRunRequest = require('../../../app/requests/charging-module/delete-bill-run.request.js')

// Thing under test
const SubmitCancelBillBunService = require('../../../app/services/bill-runs/submit-cancel-bill-run.service.js')

describe('Submit Cancel Bill Run service', () => {
  let chargingModuleDeleteBillRunRequestStub
  let notifierStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    chargingModuleDeleteBillRunRequestStub = Sinon.stub(ChargingModuleDeleteBillRunRequest, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the bill run exists', () => {
    let billRun

    describe('and can be deleted', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ status: 'ready' })

        const { id: billRunId } = billRun

        // Add records to all the tables the service deletes from
        const { id: reviewLicenceId } = await ReviewLicenceHelper.add({ billRunId })
        const { id: reviewReturnId } = await ReviewReturnHelper.add({ reviewLicenceId })
        const { id: reviewChargeVersionId } = await ReviewChargeVersionHelper.add({ reviewLicenceId })
        const { id: reviewChargeReferenceId } = await ReviewChargeReferenceHelper.add({ reviewChargeVersionId })
        const { id: reviewChargeElementId } = await ReviewChargeElementHelper.add({ reviewChargeReferenceId })

        await ReviewChargeElementReturnHelper.add({ reviewChargeElementId, reviewReturnId })
        await BillRunChargeVersionYearHelper.add({ billRunId })
        await BillRunVolumeHelper.add({ billRunId })
        const { id: billId } = await BillHelper.add({ billRunId })
        const { id: billLicenceId } = await BillLicenceHelper.add({ billId })

        await TransactionHelper.add({ billLicenceId })

        chargingModuleDeleteBillRunRequestStub.resolves()

        // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
        // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
        // test we recreate the condition by setting it directly with our own stub
        notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
        global.GlobalNotifier = notifierStub
      })

      it('sends a request to the Charging Module API to delete its copy', async () => {
        await SubmitCancelBillBunService.go(billRun.id)

        // NOTE: introducing a delay in the test is not ideal. But the service is written such that the deletion happens
        // in the background and is not awaited. We want to confirm the tables have been cleared. But the only way to do
        // so is to give the background process time to complete.
        await setTimeout(500)

        expect(chargingModuleDeleteBillRunRequestStub.called).to.be.true()
      })

      it('deletes any two-part tariff review data', async () => {
        await SubmitCancelBillBunService.go(billRun.id)

        await setTimeout(500)

        const reviewChargeElementCount = await ReviewChargeElementModel.query().select('id').resultSize()
        const reviewChargeElementReturnCount = await ReviewChargeElementReturnModel.query().select('id').resultSize()
        const reviewChargeReferenceCount = await ReviewChargeReferenceModel.query().select('id').resultSize()
        const reviewChargeVersionCount = await ReviewChargeVersionModel.query().select('id').resultSize()
        const reviewLicenceCount = await ReviewLicenceModel.query().select('id').resultSize()
        const reviewReturnCount = await ReviewReturnModel.query().select('id').resultSize()

        expect(reviewChargeElementCount).to.equal(0)
        expect(reviewChargeElementReturnCount).to.equal(0)
        expect(reviewChargeReferenceCount).to.equal(0)
        expect(reviewChargeVersionCount).to.equal(0)
        expect(reviewLicenceCount).to.equal(0)
        expect(reviewReturnCount).to.equal(0)
      })

      it('deletes any billing data data', async () => {
        await SubmitCancelBillBunService.go(billRun.id)

        await setTimeout(500)

        const billRunChargeVersionYearCount = await BillRunChargeVersionYearModel.query().select('id').resultSize()
        const billRunVolumeCount = await BillRunVolumeModel.query().select('id').resultSize()
        const transactionCount = await TransactionModel.query().select('id').resultSize()
        const billLicenceCount = await BillLicenceModel.query().select('id').resultSize()
        const billCount = await BillModel.query().select('id').resultSize()
        const billRunCount = await BillRunModel.query().select('id').resultSize()

        expect(billRunChargeVersionYearCount).to.equal(0)
        expect(billRunVolumeCount).to.equal(0)
        expect(transactionCount).to.equal(0)
        expect(billLicenceCount).to.equal(0)
        expect(billCount).to.equal(0)
        expect(billRunCount).to.equal(0)
      })
    })

    describe('but cannot be deleted because of its status', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ status: 'sent' })
      })

      it('does nothing', async () => {
        await SubmitCancelBillBunService.go(billRun.id)

        const refreshedBillRun = await billRun.$query()

        expect(refreshedBillRun).to.exist()
        expect(refreshedBillRun.status).to.equal('sent')
        expect(chargingModuleDeleteBillRunRequestStub.called).to.be.false()
      })
    })
  })

  describe('when the bill run does not exist', () => {
    it('throws as error', async () => {
      await expect(SubmitCancelBillBunService.go('testId'))
        .to
        .reject()
    })
  })
})

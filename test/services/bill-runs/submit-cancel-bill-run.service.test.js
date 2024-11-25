'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { setTimeout } = require('timers/promises')

const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunChargeVersionYearHelper = require('../../support/helpers/bill-run-charge-version-year.helper.js')
const BillRunVolumeHelper = require('../../support/helpers/bill-run-volume.helper.js')
const ReviewChargeElementHelper = require('../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementReturnHelper = require('../../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeReferenceHelper = require('../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../support/helpers/review-licence.helper.js')
const ReviewReturnHelper = require('../../support/helpers/review-return.helper.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')

// Things we need to stub
const ChargingModuleDeleteBillRunRequest = require('../../../app/requests/charging-module/delete-bill-run.request.js')

// Thing under test
const SubmitCancelBillBunService = require('../../../app/services/bill-runs/submit-cancel-bill-run.service.js')

describe('Submit Cancel Bill Run service', () => {
  let chargingModuleDeleteBillRunRequestStub
  let notifierStub

  beforeEach(() => {
    chargingModuleDeleteBillRunRequestStub = Sinon.stub(ChargingModuleDeleteBillRunRequest, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the bill run exists', () => {
    let bill
    let billLicence
    let billRun
    let billRunChargeVersionYear
    let billRunVolume
    let reviewChargeElement
    let reviewChargeElementReturn
    let reviewChargeReference
    let reviewChargeVersion
    let reviewLicence
    let reviewReturn
    let transaction

    describe('and can be deleted', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ status: 'ready' })

        const { id: billRunId } = billRun

        // Add records to all the tables the service deletes from
        reviewLicence = await ReviewLicenceHelper.add({ billRunId })
        reviewReturn = await ReviewReturnHelper.add({ reviewLicenceId: reviewLicence.id })
        reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId: reviewLicence.id })
        reviewChargeReference = await ReviewChargeReferenceHelper.add({ reviewChargeVersionId: reviewChargeVersion.id })
        reviewChargeElement = await ReviewChargeElementHelper.add({ reviewChargeReferenceId: reviewChargeReference.id })
        reviewChargeElementReturn = await ReviewChargeElementReturnHelper.add({
          reviewChargeElementId: reviewChargeElement.id,
          reviewReturnId: reviewReturn.id
        })

        billRunChargeVersionYear = await BillRunChargeVersionYearHelper.add({ billRunId })
        billRunVolume = await BillRunVolumeHelper.add({ billRunId })
        bill = await BillHelper.add({ billRunId })

        billLicence = await BillLicenceHelper.add({ billId: bill.id })
        transaction = await TransactionHelper.add({ billLicenceId: billLicence.id })

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

      it('deletes any billing data data', async () => {
        await SubmitCancelBillBunService.go(billRun.id)

        await setTimeout(500)

        const billRunChargeVersionYearCount = await billRunChargeVersionYear.$query().select('id').resultSize()
        const billRunVolumeCount = await billRunVolume.$query().select('id').resultSize()
        const transactionCount = await transaction.$query().select('id').resultSize()
        const billLicenceCount = await billLicence.$query().select('id').resultSize()
        const billCount = await bill.$query().select('id').resultSize()
        const billRunCount = await billRun.$query().select('id').resultSize()

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
      await expect(SubmitCancelBillBunService.go('testId')).to.reject()
    })
  })
})

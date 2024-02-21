'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const ReviewChargeElementResultHelper = require('../../support/helpers/review-charge-element-result.helper.js')
const ReviewChargeElementResultModel = require('../../../app/models/review-charge-element-result.model.js')
const ReviewResultHelper = require('../../support/helpers/review-result.helper.js')
const ReviewResultModel = require('../../../app/models/review-result.model.js')
const ReviewReturnResultHelper = require('../../support/helpers/review-return-result.helper.js')
const ReviewReturnResultModel = require('../../../app/models/review-return-result.model.js')

// Things we need to stub
const ChargingModuleRequestLib = require('../../../app/lib/charging-module-request.lib.js')

// Thing under test
const CancelBillRunService = require('../../../app/services/bill-runs/cancel-bill-run.service.js')

describe('Cancel Bill Run service', () => {
  const chargingModuleBillRunId = 'dd12f1b9-b5f8-4617-ae66-005b3092ed13'

  let notifierStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is a valid two-part tariff bill run to cancel', () => {
    let billRunBatchType
    let billRunId
    let reviewChargeElementResultId
    let reviewReturnResultId

    beforeEach(async () => {
      billRunBatchType = 'two_part_tariff'

      // Set up the bill run and persisted data in the DB
      const billRun = await BillRunHelper.add()
      billRunId = billRun.id
      const reviewChargeElementResult = await ReviewChargeElementResultHelper.add()
      reviewChargeElementResultId = reviewChargeElementResult.id
      const reviewReturnResult = await ReviewReturnResultHelper.add()
      reviewReturnResultId = reviewReturnResult.id
      await ReviewResultHelper.add({ billRunId, reviewChargeElementResultId, reviewReturnResultId })
    })

    describe('and the bill run record can be removed from the Charging Module', () => {
      beforeEach(() => {
        Sinon.stub(ChargingModuleRequestLib, 'delete').resolves({ succeeded: true })
      })

      it('deletes the bill run data from the Charging Module and database', async () => {
        await CancelBillRunService.go(billRunId, billRunBatchType, chargingModuleBillRunId)

        const billRun = await BillRunModel.query().findById(billRunId)
        const reviewChargeElementResult = await ReviewChargeElementResultModel.query().findById(
          reviewChargeElementResultId
        )
        const reviewResult = await ReviewResultModel.query().where('billRunId', billRunId)
        const reviewReturnResult = await ReviewReturnResultModel.query().findById(reviewReturnResultId)

        expect(notifierStub.omg.calledWith(`Bill run ${billRunId} has been cancelled`)).to.be.true()

        expect(billRun).to.be.undefined()
        expect(reviewChargeElementResult).to.be.undefined()
        expect(reviewResult).to.have.length(0)
        expect(reviewReturnResult).to.be.undefined()
      })
    })

    describe('and it is not possible to delete the bill run record from the Charging Module', () => {
      beforeEach(() => {
        Sinon.stub(ChargingModuleRequestLib, 'delete').resolves({
          succeeded: false,
          response: { body: { message: 'KABOOM' } }
        })
      })

      it('does not delete the bill run data from the Charging Module or database', async () => {
        await CancelBillRunService.go(billRunId, billRunBatchType, chargingModuleBillRunId)

        const billRun = await BillRunModel.query().findById(billRunId)
        const reviewChargeElementResult = await ReviewChargeElementResultModel.query().findById(
          reviewChargeElementResultId
        )
        const reviewResult = await ReviewResultModel.query().where('billRunId', billRunId)
        const reviewReturnResult = await ReviewReturnResultModel.query().findById(reviewReturnResultId)

        expect(notifierStub.omg.calledWith('Failed to delete bill run from Charging Module. KABOOM')).to.be.true()

        expect(billRun.id).to.equal(billRunId)
        expect(reviewChargeElementResult.id).to.equal(reviewChargeElementResultId)
        expect(reviewResult[0].billRunId).to.equal(billRunId)
        expect(reviewReturnResult.id).to.equal(reviewReturnResultId)
      })
    })
  })

  describe('when there is a non two-part tariff bill run to cancel', () => {
    let billRunBatchType
    let billRunId
    let chargingModuleStub

    beforeEach(async () => {
      billRunBatchType = 'not_two_part_tariff'

      // Set up the bill run in the DB
      const billRun = await BillRunHelper.add()
      billRunId = billRun.id

      chargingModuleStub = Sinon.stub(ChargingModuleRequestLib, 'delete').resolves()
    })

    it('does not delete the bill run data from the Charging Module or database', async () => {
      await CancelBillRunService.go(billRunId, billRunBatchType, chargingModuleBillRunId)

      const billRun = await BillRunModel.query().findById(billRunId)

      expect(notifierStub.omg.calledWith(
        'Invalid batch type of not_two_part_tariff. Bill run has not been cancelled'
      )).to.be.true()

      expect(chargingModuleStub.notCalled).to.be.true()
      expect(billRun.id).to.equal(billRunId)
    })
  })
})

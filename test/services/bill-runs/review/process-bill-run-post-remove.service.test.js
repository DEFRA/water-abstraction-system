'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const GenerateTwoPartTariffBillRunService = require('../../../../app/services/bill-runs/generate-two-part-tariff-bill-run.service.js')

// Thing under test
const ProcessBillRunPostRemoveService = require('../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js')

describe('Bill Runs - Review - Process Bill Run Post Remove service', () => {
  const billRunId = 'd4b76592-8f98-4064-892c-399ff83928f7'

  let billRun
  let billRunModifyGraphStub
  let billRunPatchStub
  let generateTwoPartTariffBillRunStub

  beforeEach(() => {
    billRunModifyGraphStub = Sinon.stub()
    billRunPatchStub = Sinon.stub().resolves()

    Sinon.stub(BillRunModel, 'query').returns({
      findById: Sinon.stub().withArgs(billRunId).returnsThis(),
      select: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis(),
      modifyGraph: billRunModifyGraphStub,
      patch: billRunPatchStub
    })

    generateTwoPartTariffBillRunStub = Sinon.stub(GenerateTwoPartTariffBillRunService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the bill run being processed is an annual two-part tariff', () => {
      beforeEach(() => {
        billRun = { id: billRunId, batchType: 'two_part_tariff' }
      })

      describe('and all licences for review have been removed (it is now empty)', () => {
        beforeEach(() => {
          billRun.reviewLicences = []

          billRunModifyGraphStub.resolves(billRun)
        })

        it('sets the status of the bill run to "empty" and returns "true"', async () => {
          const result = await ProcessBillRunPostRemoveService.go(billRunId)

          expect(result).to.be.true()

          // Check we set the bill run status
          expect(billRunPatchStub.calledOnce).to.be.true()
          expect(billRunPatchStub.firstCall.firstArg).to.equal({ status: 'empty' }, { skip: ['updatedAt'] })
        })

        it('does not trigger the generate two-part tariff bill run process', async () => {
          await ProcessBillRunPostRemoveService.go(billRunId)

          expect(generateTwoPartTariffBillRunStub.called).to.be.false()
        })
      })

      describe('and there are still licences to be reviewed', () => {
        beforeEach(() => {
          billRun.reviewLicences = [{ id: '5662b6e6-674d-4803-855b-22ddf8fea53b' }]

          billRunModifyGraphStub.resolves(billRun)
        })

        it('does not change the bill run status and returns "false"', async () => {
          const result = await ProcessBillRunPostRemoveService.go(billRunId)

          expect(result).to.be.false()

          // Check we not change the bill run status
          expect(billRunPatchStub.called).to.be.false()
        })

        it('does not trigger the generate two-part tariff bill run process', async () => {
          await ProcessBillRunPostRemoveService.go(billRunId)

          expect(generateTwoPartTariffBillRunStub.called).to.be.false()
        })
      })
    })

    describe('and the bill run being processed is a supplementary two-part tariff', () => {
      beforeEach(() => {
        billRun = { id: billRunId, batchType: 'two_part_supplementary' }
      })

      describe('and all licences for review have been removed (it is now empty)', () => {
        beforeEach(() => {
          billRun.reviewLicences = []

          billRunModifyGraphStub.resolves(billRun)
        })

        it('triggers the generate two-part tariff bill run process and returns "true"', async () => {
          const result = await ProcessBillRunPostRemoveService.go(billRunId)

          expect(result).to.be.true()

          expect(generateTwoPartTariffBillRunStub.called).to.be.true()
        })

        it('does change the status of the bill run to "empty"', async () => {
          await ProcessBillRunPostRemoveService.go(billRunId)

          expect(billRunPatchStub.calledOnce).to.be.false()
        })
      })

      describe('and there are still licences to be reviewed', () => {
        beforeEach(() => {
          billRun.reviewLicences = [{ id: '5662b6e6-674d-4803-855b-22ddf8fea53b' }]

          billRunModifyGraphStub.resolves(billRun)
        })

        it('does not trigger the generate two-part tariff bill run process and returns "false"', async () => {
          const result = await ProcessBillRunPostRemoveService.go(billRunId)

          expect(result).to.be.false()

          expect(generateTwoPartTariffBillRunStub.called).to.be.false()
        })

        it('does change the status of the bill run', async () => {
          await ProcessBillRunPostRemoveService.go(billRunId)

          expect(billRunPatchStub.calledOnce).to.be.false()
        })
      })
    })
  })
})

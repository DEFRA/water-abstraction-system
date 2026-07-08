'use strict'

// Test framework dependencies
const Sinon = require('sinon')

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
          const result = await ProcessBillRunPostRemoveService(billRunId)

          expect(result).toBe(true)

          // Check we set the bill run status
          expect(billRunPatchStub.calledOnce).toBe(true)
          expect(billRunPatchStub.firstCall.firstArg).toMatchObject({ status: 'empty' })
        })

        it('does not trigger the generate two-part tariff bill run process', async () => {
          await ProcessBillRunPostRemoveService(billRunId)

          expect(generateTwoPartTariffBillRunStub.called).toBe(false)
        })
      })

      describe('and there are still licences to be reviewed', () => {
        beforeEach(() => {
          billRun.reviewLicences = [{ id: '5662b6e6-674d-4803-855b-22ddf8fea53b' }]

          billRunModifyGraphStub.resolves(billRun)
        })

        it('does not change the bill run status and returns "false"', async () => {
          const result = await ProcessBillRunPostRemoveService(billRunId)

          expect(result).toBe(false)

          // Check we not change the bill run status
          expect(billRunPatchStub.called).toBe(false)
        })

        it('does not trigger the generate two-part tariff bill run process', async () => {
          await ProcessBillRunPostRemoveService(billRunId)

          expect(generateTwoPartTariffBillRunStub.called).toBe(false)
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
          const result = await ProcessBillRunPostRemoveService(billRunId)

          expect(result).toBe(true)

          expect(generateTwoPartTariffBillRunStub.called).toBe(true)
        })

        it('does change the status of the bill run to "empty"', async () => {
          await ProcessBillRunPostRemoveService(billRunId)

          expect(billRunPatchStub.calledOnce).toBe(false)
        })
      })

      describe('and there are still licences to be reviewed', () => {
        beforeEach(() => {
          billRun.reviewLicences = [{ id: '5662b6e6-674d-4803-855b-22ddf8fea53b' }]

          billRunModifyGraphStub.resolves(billRun)
        })

        it('does not trigger the generate two-part tariff bill run process and returns "false"', async () => {
          const result = await ProcessBillRunPostRemoveService(billRunId)

          expect(result).toBe(false)

          expect(generateTwoPartTariffBillRunStub.called).toBe(false)
        })

        it('does change the status of the bill run', async () => {
          await ProcessBillRunPostRemoveService(billRunId)

          expect(billRunPatchStub.calledOnce).toBe(false)
        })
      })
    })
  })
})

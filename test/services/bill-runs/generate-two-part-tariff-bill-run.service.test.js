'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const ExpandedErrorError = require('../../../app/errors/expanded.error.js')

// Things we need to stub
const BillRunModel = require('../../../app/models/bill-run.model.js')
const GenerateAnnualBillRunService = require('../../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js')
const GenerateSupplementaryBillRunService = require('../../../app/services/bill-runs/tpt-supplementary/generate-bill-run.service.js')

// Thing under test
const GenerateTwoPartTariffBillRunService = require('../../../app/services/bill-runs/generate-two-part-tariff-bill-run.service.js')

describe('Bill Runs - Generate Two Part Tariff Bill Run service', () => {
  const billRunDetails = {
    fromFinancialYearEnding: 2023,
    id: '8aaaf207-fd0e-4a10-9ac6-b89f68250e0f',
    toFinancialYearEnding: 2023
  }

  let billRun
  let billRunPatchStub
  let billRunSelectStub
  let generateAnnualStub
  let generateSupplementaryStub

  beforeEach(async () => {
    billRunPatchStub = Sinon.stub().resolves()
    billRunSelectStub = Sinon.stub()

    Sinon.stub(BillRunModel, 'query').returns({
      findById: Sinon.stub().returnsThis(),
      patch: billRunPatchStub,
      select: billRunSelectStub
    })

    generateAnnualStub = Sinon.stub(GenerateAnnualBillRunService, 'go')
    generateSupplementaryStub = Sinon.stub(GenerateSupplementaryBillRunService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  describe('when called', () => {
    describe('for a "two part tariff annual" bill run', () => {
      beforeEach(() => {
        billRun = { ...billRunDetails, batchType: 'two_part_tariff' }
      })

      describe('and the bill run does not have a status of "review"', () => {
        beforeEach(async () => {
          billRun.status = 'processing'
          billRunSelectStub.resolves(billRun)
        })

        it('throws an error', async () => {
          const error = await GenerateTwoPartTariffBillRunService(billRunDetails.id).catch((e) => {
            return e
          })

          expect(error).toBeInstanceOf(ExpandedErrorError)
          expect(error.message).toEqual('Cannot process a two-part tariff bill run that is not in a valid state')
          expect(error.batchType).toEqual(billRun.batchType)
          expect(error.billRunId).toEqual(billRun.id)
          expect(error.status).toEqual(billRun.status)
        })
      })

      describe('and the bill run has a status of "review"', () => {
        beforeEach(() => {
          billRun.status = 'review'
          billRunSelectStub.resolves(billRun)
        })

        it('sets the bill run status to "processing"', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(billRunPatchStub.calledOnce).toBe(true)
          expect(billRunPatchStub.firstCall.firstArg).toMatchObject({ status: 'processing' })
        })

        it('triggers the "generate annual bill run" service', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(generateAnnualStub.calledOnce).toBe(true)
          expect(generateSupplementaryStub.called).toBe(false)
        })
      })
    })

    describe('for a "two part tariff supplementary" bill run', () => {
      beforeEach(() => {
        billRun = { ...billRunDetails, batchType: 'two_part_supplementary' }
      })

      describe('and the bill run does not have a status of "review" or "processing"', () => {
        beforeEach(async () => {
          billRun.status = 'ready'
          billRunSelectStub.resolves(billRun)
        })

        it('throws an error', async () => {
          const error = await GenerateTwoPartTariffBillRunService(billRunDetails.id).catch((e) => {
            return e
          })

          expect(error).toBeInstanceOf(ExpandedErrorError)
          expect(error.message).toEqual('Cannot process a two-part tariff bill run that is not in a valid state')
          expect(error.batchType).toEqual(billRun.batchType)
          expect(error.billRunId).toEqual(billRun.id)
          expect(error.status).toEqual(billRun.status)
        })
      })

      describe('and the bill run has a status of "review"', () => {
        beforeEach(() => {
          billRun.status = 'review'
          billRunSelectStub.resolves(billRun)
        })

        it('sets the bill run status to "processing"', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(billRunPatchStub.calledOnce).toBe(true)
          expect(billRunPatchStub.firstCall.firstArg).toMatchObject({ status: 'processing' })
        })

        it('triggers the "generate supplementary bill run" service', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(generateSupplementaryStub.calledOnce).toBe(true)
          expect(generateAnnualStub.called).toBe(false)
        })
      })

      describe('and the bill run has a status of "processing"', () => {
        beforeEach(() => {
          billRun.status = 'processing'
          billRunSelectStub.resolves(billRun)
        })

        it('does not update the bill run status', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(billRunPatchStub.called).toBe(false)
        })

        it('triggers the "generate supplementary bill run" service', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(generateSupplementaryStub.calledOnce).toBe(true)
          expect(generateAnnualStub.called).toBe(false)
        })
      })
    })
  })
})

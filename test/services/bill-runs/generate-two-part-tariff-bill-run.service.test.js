// Test framework dependencies

// Test helpers
import ExpandedErrorError from '../../../app/errors/expanded.error.js'

// Things we need to stub
import BillRunModel from '../../../app/models/bill-run.model.js'
import * as GenerateAnnualBillRunService from '../../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js'
import * as GenerateSupplementaryBillRunService from '../../../app/services/bill-runs/tpt-supplementary/generate-bill-run.service.js'

// Thing under test
import GenerateTwoPartTariffBillRunService from '../../../app/services/bill-runs/generate-two-part-tariff-bill-run.service.js'

describe('Bill Runs - Generate Two Part Tariff Bill Run service', () => {
  const billRunDetails = {
    fromFinancialYearEnding: 2023,
    id: '8aaaf207-fd0e-4a10-9ac6-b89f68250e0f',
    toFinancialYearEnding: 2023
  }

  let billRun
  let billRunPatchStub
  let billRunSelectStub
  beforeEach(async () => {
    billRunPatchStub = vi.fn().mockResolvedValue()
    billRunSelectStub = vi.fn()

    vi.spyOn(BillRunModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      patch: billRunPatchStub,
      select: billRunSelectStub
    })

  })

  afterEach(() => {
    vi.restoreAllMocks()
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
          billRunSelectStub.mockResolvedValue(billRun)
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
          billRunSelectStub.mockResolvedValue(billRun)
        })

        it('sets the bill run status to "processing"', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(billRunPatchStub).toHaveBeenCalledOnce()
          expect(billRunPatchStub.firstCall.firstArg).toMatchObject({ status: 'processing' })
        })

        it('triggers the "generate annual bill run" service', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(GenerateAnnualBillRunService.default).toHaveBeenCalledOnce()
          expect(GenerateSupplementaryBillRunService.default).not.toHaveBeenCalled()
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
          billRunSelectStub.mockResolvedValue(billRun)
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
          billRunSelectStub.mockResolvedValue(billRun)
        })

        it('sets the bill run status to "processing"', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(billRunPatchStub).toHaveBeenCalledOnce()
          expect(billRunPatchStub.firstCall.firstArg).toMatchObject({ status: 'processing' })
        })

        it('triggers the "generate supplementary bill run" service', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(GenerateSupplementaryBillRunService.default).toHaveBeenCalledOnce()
          expect(GenerateAnnualBillRunService.default).not.toHaveBeenCalled()
        })
      })

      describe('and the bill run has a status of "processing"', () => {
        beforeEach(() => {
          billRun.status = 'processing'
          billRunSelectStub.mockResolvedValue(billRun)
        })

        it('does not update the bill run status', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(billRunPatchStub).not.toHaveBeenCalled()
        })

        it('triggers the "generate supplementary bill run" service', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(GenerateSupplementaryBillRunService.default).toHaveBeenCalledOnce()
          expect(GenerateAnnualBillRunService.default).not.toHaveBeenCalled()
        })
      })
    })
  })
})

// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import ExpandedErrorError from 'water-abstraction-engine/errors/expanded.error.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as FetchBillRunDal from '../../../src/dal/bill-runs/fetch-bill-run.dal.js'
import * as GenerateAnnualBillRunService from '../../../src/services/bill-runs/two-part-tariff/generate-bill-run.service.js'
import * as GenerateSupplementaryBillRunService from '../../../src/services/bill-runs/tpt-supplementary/generate-bill-run.service.js'
import * as MarkAsProcessingDal from '../../../src/dal/bill-runs/mark-as-processing.dal.js'

// Thing under test
import GenerateTwoPartTariffBillRunService from '../../../src/services/bill-runs/generate-two-part-tariff-bill-run.service.js'

describe('Bill Runs - Generate Two Part Tariff Bill Run service', () => {
  const billRunDetails = {
    fromFinancialYearEnding: 2023,
    id: generateUUID(),
    toFinancialYearEnding: 2023
  }

  let billRun
  let fetchBillRunDalStub
  let markAsProcessingDalStub

  beforeEach(async () => {
    fetchBillRunDalStub = vi.spyOn(FetchBillRunDal, 'default')
    markAsProcessingDalStub = vi.spyOn(MarkAsProcessingDal, 'default').mockResolvedValue()

    vi.spyOn(GenerateAnnualBillRunService, 'default').mockResolvedValue()
    vi.spyOn(GenerateSupplementaryBillRunService, 'default').mockResolvedValue()
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
          fetchBillRunDalStub.mockResolvedValue(billRun)
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
          fetchBillRunDalStub.mockResolvedValue(billRun)
        })

        it('sets the bill run status to "processing"', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(markAsProcessingDalStub).toHaveBeenCalledExactlyOnceWith(billRun.id)
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
          fetchBillRunDalStub.mockResolvedValue(billRun)
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
          fetchBillRunDalStub.mockResolvedValue(billRun)
        })

        it('sets the bill run status to "processing"', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(markAsProcessingDalStub).toHaveBeenCalledExactlyOnceWith(billRun.id)
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
          fetchBillRunDalStub.mockResolvedValue(billRun)
        })

        it('does not update the bill run status', async () => {
          await GenerateTwoPartTariffBillRunService(billRunDetails.id)

          expect(markAsProcessingDalStub).not.toHaveBeenCalled()
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

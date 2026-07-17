// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import NoBillingPeriodsError from '../../../app/errors/no-billing-periods.error.js'

// Things we need to stub
import * as AnnualProcessBillRunService from '../../../app/services/bill-runs/annual/process-bill-run.service.js'
import * as DetermineBillingPeriodsService from '../../../app/services/bill-runs/determine-billing-periods.service.js'
import * as InitiateBillRunService from '../../../app/services/bill-runs/initiate-bill-run.service.js'
import * as SupplementaryProcessBillRunService from '../../../app/services/bill-runs/supplementary/process-bill-run.service.js'
import * as TwoPartTariffProcessBillRunService from '../../../app/services/bill-runs/two-part-tariff/process-bill-run.service.js'
import * as TwoPartTariffSupplementaryProcessBillRunService from '../../../app/services/bill-runs/tpt-supplementary/process-bill-run.service.js'

// Thing under test
import StartBillRunProcessService from '../../../app/services/bill-runs/start-bill-run-process.service.js'

describe('Start Bill Run Process service', () => {
  const regionId = '3b24cc01-19c5-4654-8ef6-24ddb4c8dcdf'
  const userEmail = 'test@wrsl.gov.uk'

  const billRun = {
    id: 'e3bc5bb1-a223-43a2-b73f-10e6c4ed9626',
    regionId,
    scheme: 'sroc',
    batchType: 'supplementary',
    status: 'queued',
    externalId: '8c8448a6-f0ea-44a7-b41e-aafe79cb02f8',
    errorCode: null
  }

  let batchType

  afterEach(async () => {
    vi.restoreAllMocks()
  })

  describe('when the service succeeds', () => {
    beforeEach(async () => {
      const billingPeriods = [
        { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
        { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
      ]

      vi.spyOn(DetermineBillingPeriodsService, 'default').mockReturnValue(billingPeriods)
      vi.spyOn(AnnualProcessBillRunService, 'default').mockResolvedValue()
      vi.spyOn(SupplementaryProcessBillRunService, 'default').mockResolvedValue()
      vi.spyOn(TwoPartTariffProcessBillRunService, 'default').mockResolvedValue()
      vi.spyOn(TwoPartTariffSupplementaryProcessBillRunService, 'default').mockResolvedValue()
    })

    describe('and the bill run type is "annual"', () => {
      beforeEach(async () => {
        batchType = 'annual'

        const annualBillRun = {
          ...billRun,
          batchType
        }

        vi.spyOn(InitiateBillRunService, 'default').mockResolvedValue(annualBillRun)
      })

      it('initiates a new bill run', async () => {
        await StartBillRunProcessService(regionId, userEmail)

        const financialYearEndings = InitiateBillRunService.default.mock.calls[0][0]

        expect(financialYearEndings).toEqual({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('starts processing the bill run', async () => {
        await StartBillRunProcessService(regionId, userEmail)

        expect(AnnualProcessBillRunService.default).toHaveBeenCalled()
      })
    })

    describe('and the bill run type is "supplementary"', () => {
      beforeEach(async () => {
        batchType = 'supplementary'

        const supplementaryBillRun = {
          ...billRun,
          batchType
        }

        vi.spyOn(InitiateBillRunService, 'default').mockResolvedValue(supplementaryBillRun)
      })

      it('initiates a new bill run', async () => {
        await StartBillRunProcessService(regionId, batchType, userEmail)

        const financialYearEndings = InitiateBillRunService.default.mock.calls[0][0]

        expect(financialYearEndings).toEqual({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('starts processing the bill run', async () => {
        await StartBillRunProcessService(regionId, userEmail)

        expect(SupplementaryProcessBillRunService.default).toHaveBeenCalled()
      })
    })

    describe('and the bill run type is "two part tariff"', () => {
      beforeEach(async () => {
        batchType = 'two_part_tariff'

        const twoPartTariffBillRun = {
          ...billRun,
          batchType
        }

        vi.spyOn(InitiateBillRunService, 'default').mockResolvedValue(twoPartTariffBillRun)
      })

      it('initiates a new bill run', async () => {
        await StartBillRunProcessService(regionId, userEmail)

        const financialYearEndings = InitiateBillRunService.default.mock.calls[0][0]

        expect(financialYearEndings).toEqual({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('starts processing the bill run', async () => {
        await StartBillRunProcessService(regionId, userEmail)

        expect(TwoPartTariffProcessBillRunService.default).toHaveBeenCalled()
      })
    })

    describe('and the bill run type is "two part tariff supplementary"', () => {
      beforeEach(async () => {
        batchType = 'two_part_supplementary'

        const twoPartTariffSupplementaryBillRun = {
          ...billRun,
          batchType
        }

        vi.spyOn(InitiateBillRunService, 'default').mockResolvedValue(twoPartTariffSupplementaryBillRun)
      })

      it('initiates a new bill run', async () => {
        await StartBillRunProcessService(regionId, userEmail)

        const financialYearEndings = InitiateBillRunService.default.mock.calls[0][0]

        expect(financialYearEndings).toEqual({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('starts processing the bill run', async () => {
        await StartBillRunProcessService(regionId, userEmail)

        expect(TwoPartTariffSupplementaryProcessBillRunService.default).toHaveBeenCalled()
      })
    })
  })

  describe('when calling the service fails', () => {
    describe('because of an unexpected error', () => {
      beforeEach(() => {
        vi.spyOn(DetermineBillingPeriodsService, 'default').mockRejectedValue(new Error())
      })

      it('throws an error', async () => {
        await expect(StartBillRunProcessService(regionId, userEmail)).rejects.toThrow()
      })
    })

    describe('because no billing periods could be determined', () => {
      beforeEach(() => {
        vi.spyOn(DetermineBillingPeriodsService, 'default').mockReturnValue([])
      })

      it('throws a NoBillingPeriodsError', async () => {
        const result = await StartBillRunProcessService(regionId, userEmail).catch((e) => {
          return e
        })

        expect(result).toBeInstanceOf(NoBillingPeriodsError)
      })
    })
  })
})

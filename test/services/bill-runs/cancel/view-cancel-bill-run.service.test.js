// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Thing under test
import ViewCancelBillRunService from '../../../../app/services/bill-runs/cancel/view-cancel-bill-run.service.js'

describe('Bill Runs - View Cancel Bill Run service', () => {
  const billRunId = 'd351ee81-157e-4621-98eb-db121cb48cbb'

  let billRunQueryStub

  beforeEach(async () => {
    billRunQueryStub = vi.fn()

    vi.spyOn(BillRunModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis(),
      modifyGraph: billRunQueryStub
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a bill with a matching ID exists', () => {
    beforeEach(() => {
      billRunQueryStub.mockResolvedValue({
        batchType: 'annual',
        billRunNumber: 10101,
        createdAt: new Date('2024-02-28'),
        id: billRunId,
        region: {
          displayName: 'Avalon',
          id: 'a1b202f3-0673-4358-82ab-6c39c7f183fb'
        },
        scheme: 'sroc',
        status: 'ready',
        summer: false,
        toFinancialYearEnding: 2025
      })
    })
    it('will fetch the data and format it for use in the cancel bill run page', async () => {
      const result = await ViewCancelBillRunService(billRunId)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        backLink: `/system/bill-runs/${billRunId}`,
        billRunId,
        billRunNumber: 10101,
        billRunStatus: 'ready',
        billRunType: 'Annual',
        chargeScheme: 'Current',
        dateCreated: '28 February 2024',
        financialYear: '2024 to 2025',
        pageTitle: "You're about to cancel this bill run",
        region: 'Avalon'
      })
    })
  })

  describe('when a bill run with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(ViewCancelBillRunService('testId')).rejects.toThrow()
    })
  })
})

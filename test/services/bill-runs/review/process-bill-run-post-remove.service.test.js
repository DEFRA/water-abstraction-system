// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as GenerateTwoPartTariffBillRunService from '../../../../app/services/bill-runs/generate-two-part-tariff-bill-run.service.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Thing under test
import ProcessBillRunPostRemoveService from '../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js'

describe('Bill Runs - Review - Process Bill Run Post Remove service', () => {
  const billRunId = 'd4b76592-8f98-4064-892c-399ff83928f7'

  let billRun
  let billRunModifyGraphStub
  let billRunPatchStub
  beforeEach(() => {
    billRunModifyGraphStub = vi.fn()
    billRunPatchStub = vi.fn().mockResolvedValue()

    vi.spyOn(BillRunModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis(),
      modifyGraph: billRunModifyGraphStub,
      patch: billRunPatchStub
    })

    vi.spyOn(GenerateTwoPartTariffBillRunService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the bill run being processed is an annual two-part tariff', () => {
      beforeEach(() => {
        billRun = { id: billRunId, batchType: 'two_part_tariff' }
      })

      describe('and all licences for review have been removed (it is now empty)', () => {
        beforeEach(() => {
          billRun.reviewLicences = []

          billRunModifyGraphStub.mockResolvedValue(billRun)
        })

        it('sets the status of the bill run to "empty" and returns "true"', async () => {
          const result = await ProcessBillRunPostRemoveService(billRunId)

          expect(result).toBe(true)

          // Check we set the bill run status
          expect(billRunPatchStub).toHaveBeenCalledOnce()
          expect(billRunPatchStub.mock.calls[0][0]).toMatchObject({ status: 'empty' })
        })

        it('does not trigger the generate two-part tariff bill run process', async () => {
          await ProcessBillRunPostRemoveService(billRunId)

          expect(GenerateTwoPartTariffBillRunService.default).not.toHaveBeenCalled()
        })
      })

      describe('and there are still licences to be reviewed', () => {
        beforeEach(() => {
          billRun.reviewLicences = [{ id: '5662b6e6-674d-4803-855b-22ddf8fea53b' }]

          billRunModifyGraphStub.mockResolvedValue(billRun)
        })

        it('does not change the bill run status and returns "false"', async () => {
          const result = await ProcessBillRunPostRemoveService(billRunId)

          expect(result).toBe(false)

          // Check we not change the bill run status
          expect(billRunPatchStub).not.toHaveBeenCalled()
        })

        it('does not trigger the generate two-part tariff bill run process', async () => {
          await ProcessBillRunPostRemoveService(billRunId)

          expect(GenerateTwoPartTariffBillRunService.default).not.toHaveBeenCalled()
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

          billRunModifyGraphStub.mockResolvedValue(billRun)
        })

        it('triggers the generate two-part tariff bill run process and returns "true"', async () => {
          const result = await ProcessBillRunPostRemoveService(billRunId)

          expect(result).toBe(true)

          expect(GenerateTwoPartTariffBillRunService.default).toHaveBeenCalled()
        })

        it('does change the status of the bill run to "empty"', async () => {
          await ProcessBillRunPostRemoveService(billRunId)

          expect(billRunPatchStub).not.toHaveBeenCalled()
        })
      })

      describe('and there are still licences to be reviewed', () => {
        beforeEach(() => {
          billRun.reviewLicences = [{ id: '5662b6e6-674d-4803-855b-22ddf8fea53b' }]

          billRunModifyGraphStub.mockResolvedValue(billRun)
        })

        it('does not trigger the generate two-part tariff bill run process and returns "false"', async () => {
          const result = await ProcessBillRunPostRemoveService(billRunId)

          expect(result).toBe(false)

          expect(GenerateTwoPartTariffBillRunService.default).not.toHaveBeenCalled()
        })

        it('does change the status of the bill run', async () => {
          await ProcessBillRunPostRemoveService(billRunId)

          expect(billRunPatchStub).not.toHaveBeenCalled()
        })
      })
    })
  })
})

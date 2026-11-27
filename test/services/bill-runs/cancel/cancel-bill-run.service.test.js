// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as FetchBillRunDal from '../../../../src/dal/bill-runs/fetch-bill-run.dal.js'
import * as UpdateStatusDal from '../../../../src/dal/bill-runs/update-status.dal.js'

// Thing under test
import CancelBillBunService from '../../../../src/services/bill-runs/cancel/cancel-bill-run.service.js'

describe('Bill Runs - Cancel Bill Run service', () => {
  const billRunId = '20f530db-aa69-42d1-8a27-0ab838ca1916'
  const externalId = 'c5d64590-a0c9-45ee-b381-ab1ddb569751'

  let updateStatusDalStub

  beforeEach(() => {
    updateStatusDalStub = vi.spyOn(UpdateStatusDal, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the bill run exists', () => {
    describe('and can be deleted', () => {
      beforeEach(() => {
        vi.spyOn(FetchBillRunDal, 'default').mockResolvedValue({ externalId, id: billRunId, status: 'ready' })
      })

      it('sets the status of the bill run to "cancel"', async () => {
        await CancelBillBunService(billRunId)

        expect(updateStatusDalStub).toHaveBeenCalledWith(billRunId, 'cancel')
      })

      it('returns an instance of the bill run including its external ID and status set to "cancel"', async () => {
        const result = await CancelBillBunService(billRunId)

        expect(result).toEqual({ externalId, id: billRunId, status: 'cancel' })
      })
    })

    describe('but cannot be deleted because of its status', () => {
      beforeEach(async () => {
        vi.spyOn(FetchBillRunDal, 'default').mockResolvedValue({ externalId, id: billRunId, status: 'sent' })
      })

      it('does not change the bill run status', async () => {
        await CancelBillBunService(billRunId)

        expect(updateStatusDalStub).not.toHaveBeenCalled()
      })

      it('returns an instance of the bill run including its external ID and status unchanged', async () => {
        const result = await CancelBillBunService(billRunId)

        expect(result).toEqual({ externalId, id: billRunId, status: 'sent' })
      })
    })
  })

  describe('when the bill run does not exist', () => {
    beforeEach(() => {
      vi.spyOn(FetchBillRunDal, 'default').mockResolvedValue(undefined)
    })

    it('throws as error', async () => {
      await expect(CancelBillBunService('47e66de7-f05f-42d2-8fef-640b55150919')).rejects.toThrow()
    })
  })
})

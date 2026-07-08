// Test framework dependencies

// Things we need to stub
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Thing under test
import CancelBillBunService from '../../../../app/services/bill-runs/cancel/cancel-bill-run.service.js'

describe('Bill Runs - Cancel Bill Run service', () => {
  const billRunId = '20f530db-aa69-42d1-8a27-0ab838ca1916'
  const externalId = 'c5d64590-a0c9-45ee-b381-ab1ddb569751'

  let queryStub
  let billRunPatchStub

  beforeEach(() => {
    billRunPatchStub = vi.fn().mockResolvedValue()

    queryStub = vi.spyOn(BillRunModel, 'query').mockImplementation(() => {})

    queryStub.mockReturnValueOnce({
      findById: vi.fn().mockReturnThis(),
      patch: billRunPatchStub
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the bill run exists', () => {
    describe('and can be deleted', () => {
      beforeEach(() => {
        queryStub.mockReturnValueOnce({
          findById: vi.fn().mockReturnThis(),
          select: vi
            .fn().mockResolvedValue({ id: billRunId, externalId, status: 'ready' })
        })
      })

      it('sets the status of the bill run to "cancel"', async () => {
        await CancelBillBunService(billRunId)

        // Check we set the bill run status
        const [patchObject] = billRunPatchStub.mock.calls[0]

        expect(patchObject).toMatchObject({ status: 'cancel' })
      })

      it('returns an instance of the bill run including its external ID and status set to "cancel"', async () => {
        const result = await CancelBillBunService(billRunId)

        expect(result).toEqual({ id: billRunId, externalId, status: 'cancel' })
      })
    })

    describe('but cannot be deleted because of its status', () => {
      beforeEach(async () => {
        queryStub.mockReturnValueOnce({
          findById: vi.fn().mockReturnThis(),
          select: vi.fn().mockResolvedValue({ id: billRunId, externalId, status: 'sent' })
        })
      })

      it('does not change the bill run status', async () => {
        await CancelBillBunService(billRunId)

        // Check we do not change the bill run status
        expect(billRunPatchStub).not.toHaveBeenCalled()
      })

      it('returns an instance of the bill run including its external ID and status unchanged', async () => {
        const result = await CancelBillBunService(billRunId)

        expect(result).toEqual({ id: billRunId, externalId, status: 'sent' })
      })
    })
  })

  describe('when the bill run does not exist', () => {
    it('throws as error', async () => {
      await expect(CancelBillBunService('47e66de7-f05f-42d2-8fef-640b55150919')).rejects.toThrow()
    })
  })
})

// Test framework dependencies

// Things we need to stub
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Thing under test
import SendBillBunService from '../../../../app/services/bill-runs/send/send-bill-run.service.js'

describe('Bill Runs - Send Bill Run service', () => {
  let billRun
  let queryStub
  let billRunPatchStub

  beforeEach(() => {
    billRunPatchStub = vi.fn().mockResolvedValue()

    queryStub = vi.spyOn(BillRunModel, 'query').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the bill run exists', () => {
    describe('and can be sent', () => {
      beforeEach(() => {
        billRun = _billRun()

        queryStub.mockReturnValueOnce({
          findById: vi.fn().mockReturnThis(),
          select: vi.fn().mockResolvedValue(billRun)
        })

        queryStub.mockReturnValueOnce({
          findById: vi.fn().mockReturnThis(),
          patch: billRunPatchStub
        })
      })

      it('sets the status of the bill run to "sending"', async () => {
        await SendBillBunService(billRun.id)

        // Check we set the bill run status
        const [patchObject] = billRunPatchStub.mock.calls[0]

        expect(patchObject).toMatchObject({ status: 'sending' })
      })

      it('returns an instance of the bill run with its status set to "sending"', async () => {
        const result = await SendBillBunService(billRun.id)

        expect(result).toEqual({ ...billRun, status: 'sending' })
      })
    })

    describe('but cannot be sent because of its status', () => {
      beforeEach(async () => {
        billRun = _billRun()
        billRun.status = 'sent'

        queryStub.mockReturnValueOnce({
          findById: vi.fn().mockReturnThis(),
          select: vi.fn().mockResolvedValue(billRun)
        })
      })

      it('does not change the bill run status', async () => {
        await SendBillBunService(billRun.id)

        // Check we do not change the bill run status
        expect(billRunPatchStub).not.toHaveBeenCalled()
      })

      it('returns an instance of the bill run with its status unchanged', async () => {
        const result = await SendBillBunService(billRun.id)

        expect(result).toEqual(billRun)
      })
    })
  })

  describe('when the bill run does not exist', () => {
    it('throws as error', async () => {
      await expect(SendBillBunService('47e66de7-f05f-42d2-8fef-640b55150919')).rejects.toThrow()
    })
  })
})

function _billRun() {
  return {
    batchType: 'annual',
    createdAt: new Date('2024-05-07'),
    externalId: 'c5d64590-a0c9-45ee-b381-ab1ddb569751',
    id: '20f530db-aa69-42d1-8a27-0ab838ca1916',
    scheme: 'sroc',
    status: 'ready'
  }
}

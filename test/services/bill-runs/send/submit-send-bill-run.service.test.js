// Test framework dependencies

// Test helpers
import { pause } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import SendBillRunService from '../../../../app/services/bill-runs/send/send-bill-run.service.js'
import UpdateInvoiceNumbersService from '../../../../app/services/bill-runs/send/update-invoice-numbers.service.js'

// Thing under test
import SubmitSendBillRunService from '../../../../app/services/bill-runs/send/submit-send-bill-run.service.js'

describe('Bill Runs - Submit Cancel Bill Run service', () => {
  const billRunId = '800b8ff7-80e6-4855-a394-c79550115265'
  let updateDoneFake
  beforeEach(async () => {
    vi.mock('../../../../app/services/bill-runs/send/send-bill-run.service.js')
    updateDoneFake = vi.fn()
    vi.mock('../../../../app/services/bill-runs/send/update-invoice-numbers.service.js')
    UpdateInvoiceNumbersService.mockImplementation(async () => {
      await pause(500)
      updateDoneFake()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the SendBillRunService succeeds', () => {
      beforeEach(() => {
        const billRun = _billRun()

        SendBillRunService.mockResolvedValue(billRun)
      })

      it('updates the bill run invoice numbers in the background and does not throw an error', async () => {
        await SubmitSendBillRunService(billRunId)

        expect(SendBillRunService).toHaveBeenCalled()
        expect(UpdateInvoiceNumbersService).toHaveBeenCalled()

        // NOTE: We have faked the UpdateInvoiceNumbersService taking some time to complete so we can test that
        // SubmitSendBillRunService returns control back to us whilst the update is still in progress. We then pause and
        // allow the delete to complete to confirm that it was running in the background.
        expect(updateDoneFake).not.toHaveBeenCalled()

        await pause(500)

        expect(updateDoneFake).toHaveBeenCalled()
      })
    })

    // NOTE: We are only testing what happens when SendBillRunService fails because it contains no error handling
    // whereas UpdateInvoiceNumbersService has been written to ensure _no_ errors are thrown. If we were to stub it and
    // force a rejection it would not represent anything that would ever happen in the app.
    describe('and the CancelBillRunService fails', () => {
      beforeEach(() => {
        SendBillRunService.mockRejectedValue()
      })

      it('does not update the bill run and throws an error', async () => {
        await expect(SubmitSendBillRunService(billRunId)).rejects.toThrow()

        expect(UpdateInvoiceNumbersService.called).toEqual(false)
      })
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
    status: 'sending'
  }
}

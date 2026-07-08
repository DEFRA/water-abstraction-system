// Test framework dependencies

// Test helpers
import { pause } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import CancelBillRunService from '../../../../app/services/bill-runs/cancel/cancel-bill-run.service.js'
import DeleteBillRunService from '../../../../app/services/bill-runs/cancel/delete-bill-run.service.js'
import UnassignBillRunToLicencesService from '../../../../app/services/bill-runs/unassign-bill-run-to-licences.service.js'

// Thing under test
import SubmitCancelBillBunService from '../../../../app/services/bill-runs/cancel/submit-cancel-bill-run.service.js'

describe('Bill Runs - Cancel - Submit Cancel Bill Run service', () => {
  const billRunId = '800b8ff7-80e6-4855-a394-c79550115265'
  let deleteDoneFake
  beforeEach(async () => {
    vi.mock('../../../../app/services/bill-runs/cancel/cancel-bill-run.service.js')
    deleteDoneFake = vi.fn()
    vi.mock('../../../../app/services/bill-runs/cancel/delete-bill-run.service.js')
    DeleteBillRunService.mockImplementation(async () => {
      await pause(500)
      deleteDoneFake()
    })

    vi.mock('../../../../app/services/bill-runs/unassign-bill-run-to-licences.service.js')
    UnassignBillRunToLicencesService.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the CancelBillRunService succeeds', () => {
      beforeEach(() => {
        const billRun = { id: billRunId, externalId: '917aaad6-1e7b-4848-8713-1fe1d9fc1e30', status: 'cancel' }

        CancelBillRunService.mockResolvedValue(billRun)
      })

      it('unassigns the bill run from those licences with supplementary year records', async () => {
        await SubmitCancelBillBunService(billRunId)

        expect(UnassignBillRunToLicencesService).toHaveBeenCalled()
      })

      it('deletes the bill run in the background and does not throw an error', async () => {
        await SubmitCancelBillBunService(billRunId)

        expect(CancelBillRunService).toHaveBeenCalled()
        expect(DeleteBillRunService).toHaveBeenCalled()

        // NOTE: We have faked the DeleteBillRunService taking some time to complete so we can test that
        // SubmitCancelBillBunService returns control back to us whilst the delete is still in progress. We then pause
        // and allow the delete to complete to confirm that it was running in the background.
        expect(deleteDoneFake).not.toHaveBeenCalled()

        await pause(500)

        expect(deleteDoneFake).toHaveBeenCalled()
      })
    })

    // NOTE: We are only testing what happens when CancelBillRunService fails because it contains no error handling
    // whereas DeleteBillRunService has been written to ensure _no_ errors are thrown. If we were to stub it and force
    // a rejection it would not represent anything that would ever happen in the app.
    describe('and the CancelBillRunService fails', () => {
      beforeEach(() => {
        CancelBillRunService.mockRejectedValue()
      })

      it('does not unassign the bill run from those licences with supplementary year records', async () => {
        await expect(SubmitCancelBillBunService(billRunId)).rejects.toThrow()

        expect(UnassignBillRunToLicencesService).not.toHaveBeenCalled()
      })

      it('does not delete the bill run and throws an error', async () => {
        await expect(SubmitCancelBillBunService(billRunId)).rejects.toThrow()

        expect(DeleteBillRunService).not.toHaveBeenCalled()
      })
    })
  })
})

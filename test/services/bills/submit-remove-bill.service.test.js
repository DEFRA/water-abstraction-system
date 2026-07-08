// Test framework dependencies

// Things we need to stub
import BillModel from '../../../app/models/bill.model.js'
import * as LegacyDeleteBillRequest from '../../../app/requests/legacy/delete-bill.request.js'
import * as ProcessBillingFlagService from '../../../app/services/licences/supplementary/process-billing-flag.service.js'
import * as UnassignLicencesToBillRunService from '../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js'

// Thing under test
import SubmitRemoveBillService from '../../../app/services/bills/submit-remove-bill.service.js'

describe('Bills - Submit Remove Bill service', () => {
  const user = { id: '0aa9dcaa-9a26-4a77-97ab-c17db54d38a1', useremail: 'carol.shaw@atari.com' }

  let bill
  let billStub
  let legacyDeleteBillRequestStub
  beforeEach(async () => {
    bill = {
      id: '274a3c01-42fe-4ed0-9212-c703ea5feaab',
      billRunId: '340c0f17-6e01-4d6c-b2ba-e1ab027364bb',
      billLicences: [
        { id: '9d75e160-fe4c-4f1a-bce9-ecc6b35316cb', licenceId: '0716ad45-f5f0-4f3f-b8cb-f24956dcd10d' },
        { id: '1c61e430-ac5a-43ed-a2e0-854ceb45fce5', licenceId: 'eafe888c-ed7a-405b-8df7-616c8d17e91a' }
      ]
    }

    billStub = vi.fn().mockResolvedValue(bill)
    vi.spyOn(BillModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis(),
      modifyGraph: billStub
    })

    legacyDeleteBillRequestStub = vi.spyOn(LegacyDeleteBillRequest, 'send').mockResolvedValue()
    vi.spyOn(ProcessBillingFlagService, 'default').mockResolvedValue()
    vi.spyOn(UnassignLicencesToBillRunService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('unassigns any two-part tariff supplementary licences in the bill from the bill run', async () => {
      await SubmitRemoveBillService(bill.id, user)

      expect(UnassignLicencesToBillRunService.default).toHaveBeenCalled()
    })

    it('flags the two licences in the bill for supplementary billing', async () => {
      await SubmitRemoveBillService(bill.id, user)

      expect(ProcessBillingFlagService).toHaveBeenCalledTimes(2)
    })

    it('sends a request to the legacy service to delete the bill', async () => {
      await SubmitRemoveBillService(bill.id, user)

      expect(legacyDeleteBillRequestStub).toHaveBeenCalled()
    })

    it('returns the path to the legacy bill run processing page', async () => {
      const result = await SubmitRemoveBillService(bill.id, user)

      expect(result).toEqual(`/billing/batch/${bill.billRunId}/processing`)
    })
  })
})

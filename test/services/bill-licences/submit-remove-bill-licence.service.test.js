// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as LegacyDeleteBillLicenceRequest from '../../../app/requests/legacy/delete-bill-licence.request.js'
import * as ProcessBillingFlagService from '../../../app/services/licences/supplementary/process-billing-flag.service.js'
import * as UnassignLicencesToBillRunService from '../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js'
import BillLicenceModel from '../../../app/models/bill-licence.model.js'

// Thing under test
import SubmitRemoveBillLicenceService from '../../../app/services/bill-licences/submit-remove-bill-licence.service.js'

describe('Bill Licences - Submit Remove Bill Licence service', () => {
  const user = { id: '0aa9dcaa-9a26-4a77-97ab-c17db54d38a1', useremail: 'carol.shaw@atari.com' }

  let billLicence
  let billLicenceStub
  let legacyDeleteBillLicenceRequestStub
  beforeEach(async () => {
    billLicence = {
      id: '59f2510d-4b2f-4b09-a972-e0b2370d191d',
      licenceId: '5d358719-86b8-454e-a862-7a18a8a25103',
      bill: {
        id: '44c459a6-3610-4b84-b515-d4d8785ff87c',
        billRunId: 'c96106fa-b9a3-4f91-b35d-ec1d3108c390'
      }
    }

    billLicenceStub = vi.fn().mockResolvedValue(billLicence)
    vi.spyOn(BillLicenceModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockReturnThis(),
      modifyGraph: billLicenceStub
    })

    legacyDeleteBillLicenceRequestStub = vi.spyOn(LegacyDeleteBillLicenceRequest, 'default').mockResolvedValue()
    vi.spyOn(ProcessBillingFlagService, 'default').mockResolvedValue()
    vi.spyOn(UnassignLicencesToBillRunService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('calls the "UnassignLicencesToBillRunService" to unassign any licence supplementary year records from the bill run', async () => {
      await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(UnassignLicencesToBillRunService.default).toHaveBeenCalled()
    })

    it('calls the "ProcessBillingFlagService" to check if the licence needs a supplementary billing flag', async () => {
      await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(ProcessBillingFlagService.default).toHaveBeenCalled()
    })

    it('sends a request to the legacy service to delete the bill licence', async () => {
      await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(legacyDeleteBillLicenceRequestStub).toHaveBeenCalled()
    })

    it('returns the path to the legacy bill run processing page with invoice ID option', async () => {
      const result = await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(result).toEqual(`/billing/batch/${billLicence.bill.billRunId}/processing?invoiceId=${billLicence.bill.id}`)
    })
  })
})

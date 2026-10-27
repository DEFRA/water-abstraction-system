// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import UsersFixture from '../../support/fixtures/users.fixture.js'

// Things we need to stub
import * as FetchBillLicenceDal from '../../../src/dal/bill-licences/fetch-bill-licence.dal.js'
import * as LegacyDeleteBillLicenceRequest from '../../../src/requests/legacy/delete-bill-licence.request.js'
import * as ProcessBillingFlagService from '../../../src/services/licences/supplementary/process-billing-flag.service.js'
import * as UnassignLicencesToBillRunService from '../../../src/services/bill-runs/unassign-licences-to-bill-run.service.js'

// Thing under test
import SubmitRemoveBillLicenceService from '../../../src/services/bill-licences/submit-remove-bill-licence.service.js'

describe('Bill Licences - Submit Remove Bill Licence service', () => {
  const user = UsersFixture.billingAndData()

  let billLicence
  let fetchBillLicenceDalStub
  let legacyDeleteBillLicenceRequestStub

  beforeEach(() => {
    billLicence = {
      bill: {
        billRunId: generateUUID(),
        id: generateUUID()
      },
      id: generateUUID(),
      licenceId: generateUUID()
    }

    fetchBillLicenceDalStub = vi.spyOn(FetchBillLicenceDal, 'default').mockResolvedValue(billLicence)
    legacyDeleteBillLicenceRequestStub = vi.spyOn(LegacyDeleteBillLicenceRequest, 'default').mockResolvedValue()
    vi.spyOn(ProcessBillingFlagService, 'default').mockResolvedValue()
    vi.spyOn(UnassignLicencesToBillRunService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('calls the "FetchBillLicenceDal" to fetch the bill licence and its bill', async () => {
      await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(fetchBillLicenceDalStub).toHaveBeenCalledWith(billLicence.id)
    })

    it('calls the "UnassignLicencesToBillRunService" to unassign any licence supplementary year records from the bill run', async () => {
      await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(UnassignLicencesToBillRunService.default).toHaveBeenCalledWith(
        [billLicence.licenceId],
        billLicence.bill.billRunId
      )
    })

    it('calls the "ProcessBillingFlagService" to check if the licence needs a supplementary billing flag', async () => {
      await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(ProcessBillingFlagService.default).toHaveBeenCalledWith({ billLicenceId: billLicence.id })
    })

    it('sends a request to the legacy service to delete the bill licence', async () => {
      await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(legacyDeleteBillLicenceRequestStub).toHaveBeenCalledWith(billLicence.id, user)
    })

    it('returns the path to the legacy bill run processing page with invoice ID option', async () => {
      const result = await SubmitRemoveBillLicenceService(billLicence.id, user)

      expect(result).toEqual(`/billing/batch/${billLicence.bill.billRunId}/processing?invoiceId=${billLicence.bill.id}`)
    })
  })
})

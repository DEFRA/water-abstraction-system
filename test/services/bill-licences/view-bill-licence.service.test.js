// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as FetchBillLicenceTransactionsDal from '../../../src/dal/bill-licences/fetch-bill-licence-transactions.dal.js'
import * as ViewBillLicencePresenter from '../../../src/presenters/bill-licences/view-bill-licence.presenter.js'

// Thing under test
import ViewBillLicenceService from '../../../src/services/bill-licences/view-bill-licence.service.js'

describe('Bill Licences - View Bill Licence service', () => {
  let billId
  let billLicenceId

  beforeEach(() => {
    billId = generateUUID()
    billLicenceId = generateUUID()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a bill licence with a matching ID exists', () => {
    beforeEach(() => {
      vi.spyOn(FetchBillLicenceTransactionsDal, 'default').mockResolvedValue()

      vi.spyOn(ViewBillLicencePresenter, 'default').mockReturnValue({ billId })
    })

    it('will fetch the data and format it using the bill licence services', async () => {
      const result = await ViewBillLicenceService(billLicenceId)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        billId
      })

      expect(FetchBillLicenceTransactionsDal.default).toHaveBeenCalledExactlyOnceWith(billLicenceId)
    })
  })

  describe('when a bill licence with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(ViewBillLicenceService('testId')).rejects.toThrow()
    })
  })
})

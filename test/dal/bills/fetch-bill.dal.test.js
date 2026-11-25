// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillHelper from 'water-abstraction-engine/test/helpers/bill.helper.js'
import BillLicenceHelper from 'water-abstraction-engine/test/helpers/bill-licence.helper.js'

// Thing under test
import FetchBillDal from '../../../src/dal/bills/fetch-bill.dal.js'

describe('Bills - Fetch Bill dal', () => {
  let bill
  let billLicence

  beforeEach(async () => {
    bill = await BillHelper.add()
    billLicence = await BillLicenceHelper.add({ billId: bill.id })
  })

  afterEach(async () => {
    await billLicence.$query().delete()
    await bill.$query().delete()
  })

  describe('when a matching bill exists', () => {
    it('returns the bill and its linked bill licences', async () => {
      const result = await FetchBillDal(bill.id)

      expect(result).toEqual({
        billLicences: [
          {
            id: billLicence.id,
            licenceId: billLicence.licenceId
          }
        ],
        billRunId: bill.billRunId,
        id: bill.id
      })
    })
  })
})

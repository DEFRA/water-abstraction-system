// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillHelper from 'water-abstraction-engine/test/helpers/bill.helper.js'
import BillLicenceHelper from 'water-abstraction-engine/test/helpers/bill-licence.helper.js'
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'

// Thing under test
import FetchBillLicenceDal from '../../../src/dal/bill-licences/fetch-bill-licence.dal.js'

describe('Bill Licences - Fetch Bill Licence dal', () => {
  let bill
  let billLicence
  let billRun

  beforeEach(async () => {
    billRun = await BillRunHelper.add()
    bill = await BillHelper.add({ billRunId: billRun.id })
    billLicence = await BillLicenceHelper.add({ billId: bill.id })
  })

  afterEach(async () => {
    await billLicence.$query().delete()
    await bill.$query().delete()
    await billRun.$query().delete()
  })

  describe('when a bill licence with a matching ID exists', () => {
    it('returns the bill licence and its linked bill', async () => {
      const result = await FetchBillLicenceDal(billLicence.id)

      expect(result).toEqual({
        id: billLicence.id,
        licenceId: billLicence.licenceId,
        bill: {
          id: bill.id,
          billRunId: billRun.id
        }
      })
    })
  })
})

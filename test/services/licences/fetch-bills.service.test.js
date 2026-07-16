// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillHelper from '../../support/helpers/bill.helper.js'
import BillLicenceHelper from '../../support/helpers/bill-licence.helper.js'
import BillRunHelper from '../../support/helpers/bill-run.helper.js'
import LicenceHelper from '../../support/helpers/licence.helper.js'
import { generateUUID } from '../../support/generators.js'

// Thing under test
import FetchBillService from '../../../app/services/licences/fetch-bills.service.js'

describe('Licences - Fetch Bills service', () => {
  const createdDate = new Date('2022-01-01')

  let billLicence
  let billRunId
  let billingAccountId
  let licence

  beforeEach(async () => {
    billingAccountId = generateUUID()
    billRunId = generateUUID()

    licence = await LicenceHelper.add()

    billLicence = await BillLicenceHelper.add({
      licenceId: licence.id
    })
  })

  afterEach(async () => {
    await billLicence.$query().delete()
    await licence.$query().delete()
  })

  describe('when the licence has bills', () => {
    describe("and they are linked to a 'sent' bill run", () => {
      beforeEach(async () => {
        await BillRunHelper.add({ id: billRunId, status: 'sent' })

        await BillHelper.add({
          id: billLicence.billId,
          billRunId,
          invoiceNumber: '123',
          accountNumber: 'T21404193A',
          netAmount: 12345,
          billingAccountId,
          createdAt: createdDate
        })

        // Add an extra bill linked to the same bill run to test only bills for the licence are retrieved
        await BillHelper.add({ billRunId })
      })

      it('returns results', async () => {
        const result = await FetchBillService(licence.id)

        expect(result).toEqual({
          bills: [
            {
              accountNumber: 'T21404193A',
              billRun: {
                id: billRunId,
                batchType: 'supplementary',
                scheme: 'sroc',
                summer: false
              },
              billingAccountId,
              createdAt: createdDate,
              credit: null,
              deminimis: false,
              financialYearEnding: 2023,
              id: billLicence.billId,
              invoiceNumber: '123',
              legacyId: null,
              netAmount: 12345
            }
          ],
          totalNumber: 1
        })
      })
    })

    describe("but they are not linked to a 'sent' bill run", () => {
      beforeEach(async () => {
        await BillRunHelper.add({ id: billRunId })

        await BillHelper.add({
          id: billLicence.billId,
          billRunId,
          invoiceNumber: '123',
          accountNumber: 'T21404193A',
          netAmount: 12345,
          billingAccountId,
          createdAt: createdDate
        })

        // Add an extra bill linked to the same bill run to test only bills for the licence are retrieved
        await BillHelper.add({ billRunId })
      })

      it('returns no results', async () => {
        const result = await FetchBillService(licence.id)

        expect(result).toEqual({
          bills: [],
          totalNumber: 0
        })
      })
    })
  })

  describe('when the licence has no bills', () => {
    beforeEach(async () => {
      await BillRunHelper.add({ id: billRunId, status: 'sent' })
      await BillHelper.add({ id: billLicence.id, billRunId })
    })

    it('returns no results', async () => {
      const result = await FetchBillService(licence.id)

      expect(result).toEqual({
        bills: [],
        totalNumber: 0
      })
    })
  })
})

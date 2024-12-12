'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchLicenceBillService = require('../../../app/services/licences/fetch-licence-bills.service.js')

describe('Fetch Licence Bills service', () => {
  const createdDate = new Date('2022-01-01')

  let billId
  let billingAccountId
  let billRunId
  let licenceId

  beforeEach(async () => {
    billId = generateUUID()
    billingAccountId = generateUUID()
    billRunId = generateUUID()
    licenceId = generateUUID()
  })

  describe('when the licence has bills', () => {
    beforeEach(async () => {
      await BillLicenceHelper.add({
        licenceId,
        billId
      })
    })

    describe("and they are linked to a 'sent' bill run", () => {
      beforeEach(async () => {
        await BillRunHelper.add({ id: billRunId, status: 'sent' })

        await BillHelper.add({
          id: billId,
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
        const result = await FetchLicenceBillService.go(licenceId, 1)

        expect(result.pagination).to.equal({
          total: 1
        })

        expect(result.bills).to.equal([
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
            id: billId,
            invoiceNumber: '123',
            legacyId: null,
            netAmount: 12345
          }
        ])
      })
    })

    describe("but they are not linked to a 'sent' bill run", () => {
      beforeEach(async () => {
        await BillRunHelper.add({ id: billRunId })

        await BillHelper.add({
          id: billId,
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
        const result = await FetchLicenceBillService.go(licenceId, 1)

        expect(result.pagination).to.equal({
          total: 0
        })

        expect(result.bills).to.be.empty()
      })
    })
  })

  describe('when the licence has no bills', () => {
    beforeEach(async () => {
      await BillRunHelper.add({ id: billRunId, status: 'sent' })
      await BillHelper.add({ id: billId, billRunId })
      await BillLicenceHelper.add({ billId })
    })

    it('returns no results', async () => {
      const result = await FetchLicenceBillService.go(licenceId, 1)

      expect(result.pagination).to.equal({
        total: 0
      })

      expect(result.bills).to.be.empty()
    })
  })
})

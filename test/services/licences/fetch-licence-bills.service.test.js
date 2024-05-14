'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')

// Thing under test
const FetchLicenceBillService = require('../../../app/services/licences/fetch-licence-bills.service.js')

describe('Fetch Licence Bills service', () => {
  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has bills', () => {
    const createdDate = new Date('2022-01-01')

    const licenceId = '96d97293-1a62-4ad0-bcb6-24f68a203e6b'
    const billId = '72988ec1-9fb2-4b87-b0a0-3c0be628a72c'
    const billingAccountId = '0ba3b707-72ee-4296-b177-a19afff10688'
    const billRunId = 'd40004d5-a99b-40a7-adf2-22d36d5b20b5'

    beforeEach(async () => {
      await BillLicenceHelper.add({
        licenceId,
        billId
      })
    })

    describe("and they are linked to a 'sent' bill run", () => {
      beforeEach(async () => {
        await BillRunHelper.add({ id: billRunId, status: 'sent' })

        await BillHelper.add(
          {
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

        expect(result.bills).to.equal(
          [{
            accountNumber: 'T21404193A',
            billRun: {
              batchType: 'supplementary'
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
          }]
        )
      })
    })

    describe("but they are not linked to a 'sent' bill run", () => {
      beforeEach(async () => {
        await BillRunHelper.add({ id: billRunId })

        await BillHelper.add(
          {
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
})

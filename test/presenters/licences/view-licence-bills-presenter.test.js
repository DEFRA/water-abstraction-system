'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceBillsPresenter = require('../../../app/presenters/licences/view-licence-bills.presenter')

describe('View Licence Bills presenter', () => {
  describe('when provided with a bills data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceBillsPresenter.go(_bills())

      expect(result).to.equal({
        activeTab: 'bills',
        bills: [{
          account: 'acc123',
          accountId: 'bicc1233',
          billNumber: 'inv123',
          dateCreated: '1 January 2020',
          financialYear: '2021',
          id: 'id123',
          runType: 'Annual',
          total: '£123,456,789.00'
        }]
      })
    })
    it('correctly formats the currency to UK standard', () => {
      const result = ViewLicenceBillsPresenter.go(_bills())
      expect(result.bills[0].total).to.equal('£123,456,789.00')
    })
  })
})

function _bills () {
  return [{
    invoiceNumber: 'inv123',
    createdAt: new Date('2020-01-01'),
    accountNumber: 'acc123',
    batchType: 'Annual',
    financialYearEnding: '2021',
    netAmount: 123456789,
    billingAccountId: 'bicc1233',
    id: 'id123'
  }]
}

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
          runType: 'annual',
          total: '£1,234,567.89'
        }]
      })
    })
    it('correctly formats the created date to convention', () => {
      const result = ViewLicenceBillsPresenter.go(_bills())
      expect(result.bills[0].dateCreated).to.equal('1 January 2020')
    })

    it('correctly formats the currency to UK standard', () => {
      const result = ViewLicenceBillsPresenter.go(_bills())
      expect(result.bills[0].total).to.equal('£1,234,567.89')
    })

    it('correctly formats the two part tariff batch type', () => {
      const result = ViewLicenceBillsPresenter.go(_billsTwoPartTariff())
      expect(result.bills[0].runType).to.equal('two part tariff')
    })
  })
})

function _bills () {
  return [{
    accountNumber: 'acc123',
    billRun: { batchType: 'annual' },
    billingAccountId: 'bicc1233',
    createdAt: new Date('2020-01-01'),
    financialYearEnding: '2021',
    id: 'id123',
    invoiceNumber: 'inv123',
    netAmount: 123456789
  }]
}

function _billsTwoPartTariff () {
  return [{
    accountNumber: 'acc123',
    billRun: { batchType: 'two_part_tariff' },
    billingAccountId: 'bicc1233',
    createdAt: new Date('2020-01-01'),
    financialYearEnding: '2021',
    id: 'id123',
    invoiceNumber: 'inv123',
    netAmount: 123456789
  }]
}

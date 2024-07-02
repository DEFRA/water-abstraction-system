'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceBillsPresenter = require('../../../app/presenters/licences/view-licence-bills.presenter.js')

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
          credit: false,
          dateCreated: '1 January 2020',
          financialYear: '2021',
          id: 'id123',
          legacyId: null,
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

    describe('billNumber', () => {
      it('correctly formats the "billNumber" to the invoice number', () => {
        const result = ViewLicenceBillsPresenter.go(_bills())
        expect(result.bills[0].billNumber).to.equal('inv123')
      })

      it('correctly formats the "billNumber" to "De minimis bill"', () => {
        const bill = _bill()
        bill.invoiceNumber = null
        bill.deminimis = true
        const result = ViewLicenceBillsPresenter.go([bill])
        expect(result.bills[0].billNumber).to.equal('De minimis bill')
      })

      it('correctly formats the "billNumber" to "NALD revised bill"', () => {
        const bill = _bill()
        bill.invoiceNumber = null
        bill.legacyId = 'lgcy'
        const result = ViewLicenceBillsPresenter.go([bill])
        expect(result.bills[0].billNumber).to.equal('NALD revised bill')
      })

      it('correctly formats the "billNumber" to "Zero value bill"', () => {
        const bill = _bill()
        bill.invoiceNumber = null
        bill.netAmount = 0
        const result = ViewLicenceBillsPresenter.go([bill])
        expect(result.bills[0].billNumber).to.equal('Zero value bill')
      })
    })
  })
})

function _bill () {
  return {
    accountNumber: 'acc123',
    billRun: { batchType: 'annual' },
    billingAccountId: 'bicc1233',
    createdAt: new Date('2020-01-01'),
    credit: false,
    deminimis: false,
    financialYearEnding: '2021',
    id: 'id123',
    invoiceNumber: 'inv123',
    legacyId: null,
    netAmount: 123456789
  }
}

function _bills () {
  return [_bill()]
}

function _billsTwoPartTariff () {
  return [{
    accountNumber: 'acc123',
    billRun: { batchType: 'two_part_tariff' },
    billingAccountId: 'bicc1233',
    createdAt: new Date('2020-01-01'),
    credit: false,
    deminimis: false,
    financialYearEnding: '2021',
    id: 'id123',
    invoiceNumber: 'inv123',
    legacyId: null,
    netAmount: 123456789
  }]
}

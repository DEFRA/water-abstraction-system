'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ViewLicenceBillsPresenter = require('../../../app/presenters/licences/view-licence-bills.presenter.js')

describe.only('View Licence Bills presenter', () => {
  let bill

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableBillingAccountView').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a bills data', () => {
    beforeEach(() => {
      bill = _bill()
    })

    it('correctly presents the data', () => {
      const result = ViewLicenceBillsPresenter.go([bill])

      expect(result).to.equal({
        bills: [
          {
            accountNumber: 'BA1234443S',
            billingAccountId: '2563bda0-73d8-4055-b3e7-421cf188d4dc',
            billingAccountLink: '/system/billing-accounts/2563bda0-73d8-4055-b3e7-421cf188d4dc',
            billId: 'dfed8cdd-05c0-4f03-9a95-a7bae74fe7be',
            billNumber: 'WAC0003872T',
            billRunType: 'Annual',
            credit: false,
            dateCreated: '1 January 2020',
            financialYearEnding: '2021',
            total: '£1,234,567.89'
          }
        ]
      })
    })

    describe('the "bills" property', () => {
      describe('for each bill returned', () => {
        describe('when the invoice number exists', () => {
          it('correctly formats the "billNumber" to the invoice number', () => {
            const result = ViewLicenceBillsPresenter.go([bill])

            expect(result.bills[0].billNumber).to.equal('WAC0003872T')
          })
        })

        describe('the "billingAccountLink" property', () => {
          describe('when the "enableBillingAccountView" flag is true', () => {
            it('returns the system link', () => {
              const result = ViewLicenceBillsPresenter.go([bill])

              expect(result.bills[0].billingAccountLink).to.equal(`/system/billing-accounts/${bill.billingAccountId}`)
            })
          })

          describe('when the "enableBillingAccountView" flag is false', () => {
            beforeEach(() => {
              Sinon.stub(FeatureFlagsConfig, 'enableBillingAccountView').value(false)
            })

            it('returns the legacy link', () => {
              const result = ViewLicenceBillsPresenter.go([bill])

              expect(result.bills[0].billingAccountLink).to.equal(`/billing-accounts/${bill.billingAccountId}`)
            })
          })
        })

        describe('when it is flagged as deminimis', () => {
          beforeEach(() => {
            bill.invoiceNumber = null
            bill.deminimis = true
          })

          it('correctly formats the "billNumber" to "De minimis bill"', () => {
            const result = ViewLicenceBillsPresenter.go([bill])

            expect(result.bills[0].billNumber).to.equal('De minimis bill')
          })
        })

        describe('when it has a legacy ID', () => {
          beforeEach(() => {
            bill.invoiceNumber = null
            bill.legacyId = '100456'
          })

          it('correctly formats the "billNumber" to "NALD revised bill"', () => {
            const result = ViewLicenceBillsPresenter.go([bill])

            expect(result.bills[0].billNumber).to.equal('NALD revised bill')
          })
        })

        describe('when it has a zero net amount', () => {
          beforeEach(() => {
            bill.invoiceNumber = null
            bill.netAmount = 0
          })

          it('correctly formats the "billNumber" to "Zero value bill"', () => {
            const result = ViewLicenceBillsPresenter.go([bill])

            expect(result.bills[0].billNumber).to.equal('Zero value bill')
          })
        })

        describe('when it has no invoice number, deminimis flag, legacy ID, and net amount is not zero', () => {
          beforeEach(() => {
            bill.invoiceNumber = null
          })

          it('returns an empty string', () => {
            const result = ViewLicenceBillsPresenter.go([bill])

            expect(result.bills[0].billNumber).to.equal('')
          })
        })
      })
    })
  })
})

function _bill() {
  return {
    accountNumber: 'BA1234443S',
    billRun: { batchType: 'annual', scheme: 'sroc', summer: false },
    billingAccountId: '2563bda0-73d8-4055-b3e7-421cf188d4dc',
    createdAt: new Date('2020-01-01'),
    credit: false,
    deminimis: false,
    financialYearEnding: '2021',
    id: 'dfed8cdd-05c0-4f03-9a95-a7bae74fe7be',
    invoiceNumber: 'WAC0003872T',
    legacyId: null,
    netAmount: 123456789
  }
}

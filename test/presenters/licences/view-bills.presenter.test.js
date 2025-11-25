'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateAccountNumber } = require('../../support/helpers/billing-account.helper.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ViewBillsPresenter = require('../../../app/presenters/licences/view-bills.presenter.js')

describe('Licences - View Bills presenter', () => {
  let licence
  let bill

  beforeEach(() => {
    bill = _bill()

    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    Sinon.stub(FeatureFlagsConfig, 'enableBillingAccountView').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a bills data', () => {
    it('correctly presents the data', () => {
      const result = ViewBillsPresenter.go([bill], licence)

      expect(result).to.equal({
        backLink: {
          href: '/licences',
          text: 'Go back to search'
        },
        bills: [
          {
            accountNumber: bill.accountNumber,
            billingAccountId: bill.billingAccountId,
            billingAccountLink: `/system/billing-accounts/${bill.billingAccountId}?licence-id=${licence.id}`,
            billId: bill.id,
            billNumber: 'WAC0003872T',
            billRunType: 'Annual',
            credit: false,
            dateCreated: '1 January 2020',
            financialYearEnding: '2021',
            total: '£1,234,567.89'
          }
        ],
        pageTitle: 'Bills',
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })

    describe('the "bills" property', () => {
      describe('for each bill returned', () => {
        describe('when the invoice number exists', () => {
          it('correctly formats the "billNumber" to the invoice number', () => {
            const result = ViewBillsPresenter.go([bill], licence)

            expect(result.bills[0].billNumber).to.equal('WAC0003872T')
          })
        })

        describe('the "billingAccountLink" property', () => {
          describe('when the "enableBillingAccountView" flag is true', () => {
            it('returns the system link', () => {
              const result = ViewBillsPresenter.go([bill], licence)

              expect(result.bills[0].billingAccountLink).to.equal(
                `/system/billing-accounts/${bill.billingAccountId}?licence-id=${licence.id}`
              )
            })
          })

          describe('when the "enableBillingAccountView" flag is false', () => {
            beforeEach(() => {
              Sinon.stub(FeatureFlagsConfig, 'enableBillingAccountView').value(false)
            })

            it('returns the legacy link', () => {
              const result = ViewBillsPresenter.go([bill], licence)

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
            const result = ViewBillsPresenter.go([bill], licence)

            expect(result.bills[0].billNumber).to.equal('De minimis bill')
          })
        })

        describe('when it has a legacy ID', () => {
          beforeEach(() => {
            bill.invoiceNumber = null
            bill.legacyId = '100456'
          })

          it('correctly formats the "billNumber" to "NALD revised bill"', () => {
            const result = ViewBillsPresenter.go([bill], licence)

            expect(result.bills[0].billNumber).to.equal('NALD revised bill')
          })
        })

        describe('when it has a zero net amount', () => {
          beforeEach(() => {
            bill.invoiceNumber = null
            bill.netAmount = 0
          })

          it('correctly formats the "billNumber" to "Zero value bill"', () => {
            const result = ViewBillsPresenter.go([bill], licence)

            expect(result.bills[0].billNumber).to.equal('Zero value bill')
          })
        })

        describe('when it has no invoice number, deminimis flag, legacy ID, and net amount is not zero', () => {
          beforeEach(() => {
            bill.invoiceNumber = null
          })

          it('returns an empty string', () => {
            const result = ViewBillsPresenter.go([bill], licence)

            expect(result.bills[0].billNumber).to.equal('')
          })
        })
      })
    })
  })
})

function _bill() {
  return {
    accountNumber: generateAccountNumber(),
    billRun: { batchType: 'annual', scheme: 'sroc', summer: false },
    billingAccountId: generateUUID(),
    createdAt: new Date('2020-01-01'),
    credit: false,
    deminimis: false,
    financialYearEnding: '2021',
    id: generateUUID(),
    invoiceNumber: 'WAC0003872T',
    legacyId: null,
    netAmount: 123456789
  }
}

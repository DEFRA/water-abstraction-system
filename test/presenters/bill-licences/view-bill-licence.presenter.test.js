'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const CompensationChargeTransactionPresenter = require('../../../app/presenters/bill-licences/compensation-charge-transaction.presenter.js')
const MinimumChargeTransactionPresenter = require('../../../app/presenters/bill-licences/minimum-charge-transaction.presenter.js')
const StandardChargeTransactionPresenter = require('../../../app/presenters/bill-licences/standard-charge-transaction.presenter.js')

// Thing under test
const ViewBillLicencePresenter = require('../../../app/presenters/bill-licences/view-bill-licence.presenter.js')

describe('View Bill Licence presenter', () => {
  let billLicence

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a populated bill licence', () => {
    beforeEach(() => {
      billLicence = _testBillLicence()

      Sinon.stub(CompensationChargeTransactionPresenter, 'go').returns({ chargeType: 'compensation' })
      Sinon.stub(MinimumChargeTransactionPresenter, 'go').returns({ chargeType: 'minimum_charge' })
      Sinon.stub(StandardChargeTransactionPresenter, 'go').returns({ chargeType: 'standard' })
    })

    describe("the 'displayCreditDebitTotals' property", () => {
      describe('when the linked bill run is not supplementary', () => {
        beforeEach(() => {
          billLicence.bill.billRun.batchType = 'annual'
        })

        it('returns false', () => {
          const result = ViewBillLicencePresenter.go(billLicence)

          expect(result.displayCreditDebitTotals).to.be.false()
        })
      })

      describe('when the bill run is supplementary', () => {
        describe('and was created in WRLS', () => {
          beforeEach(() => {
            billLicence.bill.billRun.batchType = 'supplementary'
          })

          it('returns true', () => {
            const result = ViewBillLicencePresenter.go(billLicence)

            expect(result.displayCreditDebitTotals).to.be.true()
          })
        })

        describe('but was created in NALD', () => {
          beforeEach(() => {
            billLicence.bill.billRun.batchType = 'supplementary'
            billLicence.bill.billRun.source = 'nald'
          })

          it('returns false', () => {
            const result = ViewBillLicencePresenter.go(billLicence)

            expect(result.displayCreditDebitTotals).to.be.false()
          })
        })
      })
    })

    describe("the 'tableCaption' property", () => {
      describe('when there is only 1 transaction', () => {
        beforeEach(() => {
          billLicence.transactions = [billLicence.transactions[0]]
        })

        it('returns the count and caption singular', () => {
          const result = ViewBillLicencePresenter.go(billLicence)

          expect(result.tableCaption).to.equal('1 transaction')
        })
      })

      describe('when there are multiple transactions', () => {
        it('returns the count and caption pluralised', () => {
          const result = ViewBillLicencePresenter.go(billLicence)

          expect(result.tableCaption).to.equal('4 transactions')
        })
      })
    })

    it('correctly presents the data', () => {
      const result = ViewBillLicencePresenter.go(billLicence)

      // NOTE: The transaction details we pass in and what we get back is not what would actually happen. Our
      // transaction presenter tests exhaust what we expect back for all scenarios. What we are confirming though is
      // that depending on a transaction's charge type ViewBillLicencePresenter will call the relevant transaction
      // presenter. Plus, that things like the totals and the table caption is returned as expected.
      expect(result).to.equal({
        accountNumber: 'W88898987A',
        billingInvoiceId: '5a5b313b-e707-490a-a693-799339941e4f',
        creditTotal: '£10.00',
        debitTotal: '£298.37',
        displayCreditDebitTotals: true,
        licenceId: '2eaa831d-7bd6-4b0a-aaf1-3aacafec6bf2',
        licenceRef: 'WA/055/0017/013',
        scheme: 'alcs',
        tableCaption: '4 transactions',
        total: '£288.37',
        transactions: [
          { chargeType: 'standard' },
          { chargeType: 'standard' },
          { chargeType: 'compensation' },
          { chargeType: 'minimum_charge' }
        ]
      })
    })
  })
})

function _testBillLicence () {
  return {
    billingInvoiceLicenceId: 'a4fbaa27-a91c-4328-a1b8-774ade11027b',
    licenceId: '2eaa831d-7bd6-4b0a-aaf1-3aacafec6bf2',
    licenceRef: 'WA/055/0017/013',
    bill: {
      billingInvoiceId: '5a5b313b-e707-490a-a693-799339941e4f',
      invoiceAccountNumber: 'W88898987A',
      billRun: {
        billingBatchId: '0e61c36f-f22f-4534-8247-b73a97f551b5',
        batchType: 'supplementary',
        scheme: 'alcs',
        source: 'wrls'
      }
    },
    transactions: [
      {
        billingTransactionId: '5858e36f-5a8e-4f5c-84b3-cbca26624d67',
        chargeType: 'standard',
        isCredit: false,
        netAmount: 29837
      },
      {
        billingTransactionId: '5858e36f-5a8e-4f5c-84b3-cbca26624d67',
        chargeType: 'standard',
        isCredit: true,
        netAmount: -1000
      },
      {
        billingTransactionId: '14d6d530-7f07-4e4b-ac17-b8ade9f5b21a',
        chargeType: 'compensation',
        isCredit: false,
        netAmount: 0
      },
      {
        billingTransactionId: '23f43d51-8880-4e30-89da-40231cb8dea2',
        chargeType: 'minimum_charge',
        isCredit: false,
        netAmount: 0
      }
    ]
  }
}

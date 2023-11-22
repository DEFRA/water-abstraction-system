'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ViewCompensationChargeTransactionPresenter = require('../../../app/presenters/bill-licences/view-compensation-charge-transaction.presenter.js')
const ViewMinimumChargeTransactionPresenter = require('../../../app/presenters/bill-licences/view-minimum-charge-transaction.presenter.js')
const ViewStandardChargeTransactionPresenter = require('../../../app/presenters/bill-licences/view-standard-charge-transaction.presenter.js')

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

      Sinon.stub(ViewCompensationChargeTransactionPresenter, 'go').returns({ chargeType: 'compensation' })
      Sinon.stub(ViewMinimumChargeTransactionPresenter, 'go').returns({ chargeType: 'minimum_charge' })
      Sinon.stub(ViewStandardChargeTransactionPresenter, 'go').returns({ chargeType: 'standard' })
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
        it('returns true', () => {
          const result = ViewBillLicencePresenter.go(billLicence)

          expect(result.displayCreditDebitTotals).to.be.true()
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

    describe('and the total for the transactions is a debit', () => {
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
          transactions: [
            { chargeType: 'standard' },
            { chargeType: 'standard' },
            { chargeType: 'compensation' },
            { chargeType: 'minimum_charge' }
          ],
          transactionsTotal: '£288.37'
        })
      })
    })

    describe('and the total for the transactions is a credit', () => {
      beforeEach(() => {
        billLicence.transactions[0].isCredit = true
        billLicence.transactions[0].netAmount = -29837
        billLicence.transactions[1].isCredit = false
        billLicence.transactions[1].netAmount = 1000
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
          creditTotal: '£298.37',
          debitTotal: '£10.00',
          displayCreditDebitTotals: true,
          licenceId: '2eaa831d-7bd6-4b0a-aaf1-3aacafec6bf2',
          licenceRef: 'WA/055/0017/013',
          scheme: 'alcs',
          tableCaption: '4 transactions',
          transactions: [
            { chargeType: 'standard' },
            { chargeType: 'standard' },
            { chargeType: 'compensation' },
            { chargeType: 'minimum_charge' }
          ],
          transactionsTotal: '-£288.37'
        })
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

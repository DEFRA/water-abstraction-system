'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchPreviousBillingTransactionsService = require('../../../../app/services/billing/supplementary/fetch-previous-billing-transactions.service.js')

// Thing under test
const ProcessBillingTransactionsService = require('../../../../app/services/billing/supplementary/process-billing-transactions.service.js')

describe('Process Billing Transactions service', () => {
  const bill = { billingInvoiceId: 'a56ef6d9-370a-4224-b6ec-0fca8bfa4d1f' }
  const billLicence = { billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269' }

  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the bill, licence and period', () => {
    let calculatedTransactions

    beforeEach(() => {
      calculatedTransactions = [
        _generateCalculatedTransaction('4.10.1', 365, 'CALCULATED_TRANSACTION_1'),
        _generateCalculatedTransaction('5.11.2', 265, 'CALCULATED_TRANSACTION_2'),
        _generateCalculatedTransaction('6.12.3', 100, 'CALCULATED_TRANSACTION_3')
      ]
    })

    describe('match to transactions on a previous bill run', () => {
      describe('and the calculated transactions provided', () => {
        let previousTransactions

        describe('match all the previous transactions from the last bill run', () => {
          beforeEach(() => {
            previousTransactions = [
              _generatePreviousTransaction('4.10.1', 365, 'I_WILL_BE_REMOVED_1'),
              _generatePreviousTransaction('5.11.2', 265, 'I_WILL_BE_REMOVED_2')
            ]

            Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns the matched calculated transactions', async () => {
            const result = await ProcessBillingTransactionsService.go(
              calculatedTransactions,
              bill,
              billLicence,
              billingPeriod
            )

            expect(result).to.have.length(1)
            expect(result[0]).to.equal(calculatedTransactions[2])
          })
        })

        describe('are cancelled out by the previous transactions from the last bill run', () => {
          beforeEach(() => {
            previousTransactions = [
              _generatePreviousTransaction('4.10.1', 365, 'I_WILL_BE_REMOVED_1'),
              _generatePreviousTransaction('5.11.2', 265, 'I_WILL_BE_REMOVED_2'),
              _generatePreviousTransaction('6.12.3', 100, 'I_WILL_BE_REMOVED_3')
            ]

            Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns no transactions', async () => {
            const result = await ProcessBillingTransactionsService.go(
              calculatedTransactions,
              bill,
              billLicence,
              billingPeriod
            )

            expect(result).to.be.empty()
          })
        })

        describe('are empty', () => {
          beforeEach(() => {
            previousTransactions = [
              _generatePreviousTransaction('4.10.1', 365, 'I_WILL_NOT_BE_REMOVED_1'),
              _generatePreviousTransaction('5.11.2', 265, 'I_WILL_NOT_BE_REMOVED_2')
            ]

            Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns only the previous transactions', async () => {
            const result = await ProcessBillingTransactionsService.go(
              [],
              bill,
              billLicence,
              billingPeriod
            )

            expect(result).to.have.length(2)
            expect(result[0].purposes).to.equal('I_WILL_NOT_BE_REMOVED_1')
            expect(result[1].purposes).to.equal('I_WILL_NOT_BE_REMOVED_2')
          })
        })

        describe('partially match the previous transactions from the last bill run', () => {
          beforeEach(() => {
            previousTransactions = [
              _generatePreviousTransaction('4.10.1', 365, 'I_WILL_BE_REMOVED_1'),
              _generatePreviousTransaction('5.11.2', 265, 'I_WILL_BE_REMOVED_2'),
              _generatePreviousTransaction('9.9.9', 180, 'I_WILL_NOT_BE_REMOVED')
            ]

            Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns the unmatched calculated transactions and previous transactions (reversed)', async () => {
            const result = await ProcessBillingTransactionsService.go(
              calculatedTransactions,
              bill,
              billLicence,
              billingPeriod
            )

            expect(result).to.have.length(2)
            expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION_3')
            expect(result[1].purposes).to.equal('I_WILL_NOT_BE_REMOVED')
            expect(result[1].isCredit).to.be.true()
          })
        })
      })
    })

    describe('do not match to transactions on a previous bill run', () => {
      beforeEach(() => {
        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves([])
      })

      it('returns the calculated transactions unchanged', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(3)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION_1')
        expect(result[1].purposes).to.equal('CALCULATED_TRANSACTION_2')
        expect(result[2].purposes).to.equal('CALCULATED_TRANSACTION_3')
      })
    })
  })

  describe('the service matches calculated to previous transactions', () => {
    let calculatedTransactions

    beforeEach(() => {
      calculatedTransactions = [_generateCalculatedTransaction('4.10.1', 365, 'CALCULATED_TRANSACTION')]
    })

    describe('when the charge type differs', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction(
            '4.10.1', 365, 'PREVIOUS_TRANSACTION', { chargeType: 'compensation' }
          )
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the charge category code differs', () => {
      beforeEach(() => {
        const previousTransactions = [_generatePreviousTransaction('5.10.1', 365, 'PREVIOUS_TRANSACTION')]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the billable days differ', () => {
      beforeEach(() => {
        const previousTransactions = [_generatePreviousTransaction('4.10.1', 5, 'PREVIOUS_TRANSACTION')]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the abatement agreement (section 126) differs', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { section126Factor: 0.5 })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the two-part tariff agreement (section 127) differs', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { section127Agreement: true })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the canal and river trust agreement (section 130) differs', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { section130Agreement: true })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the aggregate differs', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { aggregateFactor: 0.5 })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the charge adjustment differs', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { adjustmentFactor: 0.5 })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the winter discount differs', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { isWinterOnly: true })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when if it is a supported source differs (additional charge)', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { isSupportedSource: true })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the supported source name differs (additional charge)', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { supportedSourceName: 'source name' })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when the water company flag differs (additional charge)', () => {
      beforeEach(() => {
        const previousTransactions = [
          _generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION', { isWaterCompanyCharge: true })
        ]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('does not match the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.have.length(2)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION')
        expect(result[1].purposes).to.equal('PREVIOUS_TRANSACTION')
      })
    })

    describe('when nothing differs', () => {
      beforeEach(() => {
        const previousTransactions = [_generatePreviousTransaction('4.10.1', 365, 'PREVIOUS_TRANSACTION')]

        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
      })

      it('matches the transactions', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          bill,
          billLicence,
          billingPeriod
        )

        expect(result).to.be.empty()
      })
    })
  })
})

function _generateCalculatedTransaction (chargeCategoryCode, billableDays, testReference, changes = {}) {
  const defaultProperties = {
    billingTransactionId: '61abdc15-7859-4783-9622-6cb8de7f2461',
    billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
    isCredit: false,
    status: 'candidate',
    chargeType: 'standard',
    chargeCategoryCode,
    billableDays,
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: false,
    aggregateFactor: 1,
    adjustmentFactor: 1,
    isWinterOnly: false,
    isSupportedSource: false,
    supportedSourceName: null,
    isWaterCompanyCharge: false,
    purposes: testReference
  }

  return {
    ...defaultProperties,
    ...changes
  }
}

function _generatePreviousTransaction (chargeCategoryCode, billableDays, testReference, changes = {}) {
  const defaultProperties = {
    billingTransactionId: '8d68eb26-d054-47a7-aee8-cd93a24fa860',
    billingInvoiceLicenceId: 'a76b3ab3-d70d-4fb0-8d72-2e2cdd334729',
    isCredit: false,
    status: 'candidate',
    chargeType: 'standard',
    chargeCategoryCode,
    billableDays,
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: false,
    aggregateFactor: 1,
    adjustmentFactor: 1,
    isWinterOnly: false,
    isSupportedSource: false,
    supportedSourceName: null,
    isWaterCompanyCharge: false,
    purposes: [testReference]
  }

  return {
    ...defaultProperties,
    ...changes
  }
}

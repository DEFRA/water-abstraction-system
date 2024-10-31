'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const FetchPreviousTransactionsService = require('../../../../app/services/bill-runs/supplementary/fetch-previous-transactions.service.js')

// Thing under test
const ProcessTransactionsService = require('../../../../app/services/bill-runs/supplementary/process-transactions.service.js')

describe('Process Transactions service', () => {
  const billingAccountId = 'a56ef6d9-370a-4224-b6ec-0fca8bfa4d1f'
  const billLicence = {
    id: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
    licenceId: '9d587a65-aa00-4be6-969e-5bbb9fc6c885'
  }

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
      describe('and some of the calculated transactions provided', () => {
        let previousTransactions

        describe('match to all the previous transactions from the last bill run', () => {
          beforeEach(() => {
            previousTransactions = [
              _generatePreviousTransaction('4.10.1', 365, 'I_WILL_BE_REMOVED_1'),
              _generatePreviousTransaction('5.11.2', 265, 'I_WILL_BE_REMOVED_2')
            ]

            Sinon.stub(FetchPreviousTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns the unmatched calculated transactions', async () => {
            const result = await ProcessTransactionsService.go(
              calculatedTransactions,
              billingAccountId,
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

            Sinon.stub(FetchPreviousTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns no transactions', async () => {
            const result = await ProcessTransactionsService.go(
              calculatedTransactions,
              billingAccountId,
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

            Sinon.stub(FetchPreviousTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns only the previous transactions', async () => {
            const result = await ProcessTransactionsService.go(
              [],
              billingAccountId,
              billLicence,
              billingPeriod
            )

            expect(result).to.have.length(2)
            expect(result[0].purposes).to.equal(['I_WILL_NOT_BE_REMOVED_1'])
            expect(result[1].purposes).to.equal(['I_WILL_NOT_BE_REMOVED_2'])
          })
        })

        describe('partially match the previous transactions from the last bill run', () => {
          beforeEach(() => {
            previousTransactions = [
              _generatePreviousTransaction('4.10.1', 365, 'I_WILL_BE_REMOVED_1'),
              _generatePreviousTransaction('5.11.2', 265, 'I_WILL_BE_REMOVED_2'),
              _generatePreviousTransaction('9.9.9', 180, 'I_WILL_NOT_BE_REMOVED')
            ]

            Sinon.stub(FetchPreviousTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns the unmatched calculated transactions and previous transactions (reversed)', async () => {
            const result = await ProcessTransactionsService.go(
              calculatedTransactions,
              billingAccountId,
              billLicence,
              billingPeriod
            )

            expect(result).to.have.length(2)
            expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION_3')
            expect(result[1].purposes).to.equal(['I_WILL_NOT_BE_REMOVED'])
            expect(result[1].credit).to.be.true()
          })
        })
      })
    })

    describe('do not match to transactions on a previous bill run', () => {
      beforeEach(() => {
        Sinon.stub(FetchPreviousTransactionsService, 'go').resolves([])
      })

      it('returns the calculated transactions unchanged', async () => {
        const result = await ProcessTransactionsService.go(
          calculatedTransactions,
          billingAccountId,
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
})

function _generateCalculatedTransaction (chargeCategoryCode, billableDays, testReference, changes = {}) {
  const defaultProperties = {
    id: '61abdc15-7859-4783-9622-6cb8de7f2461',
    billLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
    credit: false,
    status: 'candidate',
    chargeType: 'standard',
    chargeCategoryCode,
    billableDays,
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: false,
    aggregateFactor: 1,
    adjustmentFactor: 1,
    winterOnly: false,
    supportedSource: false,
    supportedSourceName: null,
    waterCompanyCharge: false,
    purposes: testReference
  }

  return {
    ...defaultProperties,
    ...changes
  }
}

function _generatePreviousTransaction (chargeCategoryCode, billableDays, testReference, changes = {}) {
  const defaultProperties = {
    id: '8d68eb26-d054-47a7-aee8-cd93a24fa860',
    billLicenceId: 'a76b3ab3-d70d-4fb0-8d72-2e2cdd334729',
    credit: false,
    status: 'candidate',
    chargeType: 'standard',
    chargeCategoryCode,
    billableDays,
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: false,
    aggregateFactor: 1,
    adjustmentFactor: 1,
    winterOnly: false,
    supportedSource: false,
    supportedSourceName: null,
    waterCompanyCharge: false,
    purposes: [testReference]
  }

  return {
    ...defaultProperties,
    ...changes
  }
}

'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ProcessSupplementaryTransactionsService = require('../../../app/services/bill-runs/process-supplementary-transactions.service.js')

describe('Bill Runs - Process Supplementary Transactions service', () => {
  const billLicenceId = '9d587a65-aa00-4be6-969e-5bbb9fc6c885'

  describe('when the bill, licence and period', () => {
    let generatedTransactions

    beforeEach(() => {
      generatedTransactions = [
        _generatedTransaction('4.10.1', 365, 'GENERATED_TRANSACTION_1'),
        _generatedTransaction('5.11.2', 265, 'GENERATED_TRANSACTION_2'),
        _generatedTransaction('6.12.3', 100, 'GENERATED_TRANSACTION_3')
      ]
    })

    describe('match to transactions on a previous bill run', () => {
      describe('and some of the generated transactions provided', () => {
        let previousTransactions

        describe('match to all the previous transactions from the last bill run', () => {
          beforeEach(() => {
            previousTransactions = [
              _previousTransaction('4.10.1', 365, 'I_WILL_BE_REMOVED_1'),
              _previousTransaction('5.11.2', 265, 'I_WILL_BE_REMOVED_2')
            ]
          })

          it('returns the unmatched generated transactions', async () => {
            const result = await ProcessSupplementaryTransactionsService.go(
              previousTransactions,
              generatedTransactions,
              billLicenceId
            )

            expect(result).to.have.length(1)
            expect(result[0]).to.equal(generatedTransactions[2])
          })
        })

        describe('are cancelled out by the previous transactions from the last bill run', () => {
          beforeEach(() => {
            previousTransactions = [
              _previousTransaction('4.10.1', 365, 'I_WILL_BE_REMOVED_1'),
              _previousTransaction('5.11.2', 265, 'I_WILL_BE_REMOVED_2'),
              _previousTransaction('6.12.3', 100, 'I_WILL_BE_REMOVED_3')
            ]
          })

          it('returns no transactions', async () => {
            const result = await ProcessSupplementaryTransactionsService.go(
              previousTransactions,
              generatedTransactions,
              billLicenceId
            )

            expect(result).to.be.empty()
          })
        })

        describe('are empty', () => {
          beforeEach(() => {
            previousTransactions = [
              _previousTransaction('4.10.1', 365, 'I_WILL_NOT_BE_REMOVED_1'),
              _previousTransaction('5.11.2', 265, 'I_WILL_NOT_BE_REMOVED_2')
            ]
          })

          it('returns only the previous transactions', async () => {
            const result = await ProcessSupplementaryTransactionsService.go(previousTransactions, [], billLicenceId)

            expect(result).to.have.length(2)
            expect(result[0].purposes).to.equal(['I_WILL_NOT_BE_REMOVED_1'])
            expect(result[1].purposes).to.equal(['I_WILL_NOT_BE_REMOVED_2'])
          })
        })

        describe('partially match the previous transactions from the last bill run', () => {
          beforeEach(() => {
            previousTransactions = [
              _previousTransaction('4.10.1', 365, 'I_WILL_BE_REMOVED_1'),
              _previousTransaction('5.11.2', 265, 'I_WILL_BE_REMOVED_2'),
              _previousTransaction('9.9.9', 180, 'I_WILL_NOT_BE_REMOVED')
            ]
          })

          it('returns the unmatched generated transactions and previous transactions (reversed)', async () => {
            const result = await ProcessSupplementaryTransactionsService.go(
              previousTransactions,
              generatedTransactions,
              billLicenceId
            )

            expect(result).to.have.length(2)
            expect(result[0].purposes).to.equal('GENERATED_TRANSACTION_3')
            expect(result[1].purposes).to.equal(['I_WILL_NOT_BE_REMOVED'])
            expect(result[1].credit).to.be.true()
          })
        })
      })
    })

    describe('do not match to transactions on a previous bill run', () => {
      it('returns the generated transactions unchanged', async () => {
        const result = await ProcessSupplementaryTransactionsService.go([], generatedTransactions, billLicenceId)

        expect(result).to.have.length(3)
        expect(result[0].purposes).to.equal('GENERATED_TRANSACTION_1')
        expect(result[1].purposes).to.equal('GENERATED_TRANSACTION_2')
        expect(result[2].purposes).to.equal('GENERATED_TRANSACTION_3')
      })
    })
  })
})

function _generatedTransaction(chargeCategoryCode, billableDays, testReference, changes = {}) {
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

function _previousTransaction(chargeCategoryCode, billableDays, testReference, changes = {}) {
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

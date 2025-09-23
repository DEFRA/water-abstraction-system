'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const ChargeElementHelper = require('../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/charge-reference.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')

// Thing under test
const FetchBillLicenceService = require('../../../app/services/bill-licences/fetch-bill-licence.service.js')

describe('Bill Licences - Fetch Bill Licence service', () => {
  let bill
  let billLicence
  let billRun
  let chargeReference
  let chargeElements
  let transactions
  let purpose

  afterEach(async () => {
    for (const transaction of transactions) {
      transaction.$query().delete()
    }

    for (const chargeElement of chargeElements) {
      chargeElement.$query().delete()
    }

    if (billRun) {
      chargeReference.$query().delete()
      billLicence.$query().delete()
      bill.$query().delete()
      billRun.$query().delete()
    }
  })

  describe('when a matching SROC bill licence exists', () => {
    beforeEach(async () => {
      purpose = PurposeHelper.select()

      billRun = await BillRunHelper.add({ scheme: 'sroc', status: 'ready' })
      bill = await BillHelper.add({ billRunId: billRun.id })
      billLicence = await BillLicenceHelper.add({ billId: bill.id })

      chargeReference = await ChargeReferenceHelper.add()

      chargeElements = []
      for (let i = 0; i < 2; i++) {
        const chargeElement = await ChargeElementHelper.add({
          chargeReferenceId: chargeReference.id,
          purposeId: purpose.id
        })
        chargeElements.push(chargeElement)
      }

      const transactionValues = [
        {
          billableDays: 10,
          chargeCategoryCode: '4.3.1',
          createdAt: new Date(),
          description: '3',
          grossValuesCalculated: {
            baselineCharge: '107.70',
            supportedSourceCharge: '123.3',
            waterCompanyCharge: '321.99'
          }
        },
        {
          billableDays: 365,
          chargeCategoryCode: '4.3.2',
          createdAt: new Date('2023-02-02'),
          description: '1',
          grossValuesCalculated: {
            baselineCharge: '987',
            supportedSourceCharge: '12345',
            waterCompanyCharge: '6543'
          }
        },
        {
          billableDays: 20,
          chargeCategoryCode: '4.3.1',
          createdAt: new Date(),
          description: '2',
          grossValuesCalculated: {}
        },
        {
          billableDays: 365,
          chargeCategoryCode: '4.3.2',
          createdAt: new Date('2023-02-01'),
          description: '0',
          grossValuesCalculated: {}
        }
      ]

      transactions = []
      for (const transactionData of transactionValues) {
        const transaction = await TransactionHelper.add({
          billableDays: transactionData.billableDays,
          billLicenceId: billLicence.id,
          chargeCategoryCode: transactionData.chargeCategoryCode,
          chargeReferenceId: chargeReference.id,
          createdAt: transactionData.createdAt,
          description: transactionData.description,
          grossValuesCalculated: transactionData.grossValuesCalculated
        })
        transactions.push(transaction)
      }
    })

    it('returns the matching bill licence and associated data', async () => {
      const result = await FetchBillLicenceService.go(billLicence.id)

      expect(result).to.equal({
        id: billLicence.id,
        licenceId: billLicence.licenceId,
        licenceRef: billLicence.licenceRef,
        bill: {
          id: bill.id,
          accountNumber: bill.accountNumber,
          billRun: {
            id: billRun.id,
            batchType: 'supplementary',
            scheme: 'sroc',
            source: 'wrls',
            status: 'ready'
          }
        },
        transactions: [
          _transactionResult(transactions[3], chargeReference, chargeElements, purpose),
          _transactionResult(transactions[1], chargeReference, chargeElements, purpose),
          _transactionResult(transactions[2], chargeReference, chargeElements, purpose),
          _transactionResult(transactions[0], chargeReference, chargeElements, purpose)
        ]
      })
    })
  })

  describe('when a matching PRESROC bill licence exists', () => {
    beforeEach(async () => {
      purpose = PurposeHelper.select()

      billRun = await BillRunHelper.add({ scheme: 'alcs', status: 'ready' })
      bill = await BillHelper.add({ billRunId: billRun.id })
      billLicence = await BillLicenceHelper.add({ billId: bill.id })

      chargeReference = await ChargeReferenceHelper.add({ purposeId: purpose.id })

      chargeElements = []

      const transactionValues = [
        {
          billableDays: 10,
          createdAt: new Date(),
          description: '3',
          grossValuesCalculated: {
            baselineCharge: '107.70',
            supportedSourceCharge: '123.3',
            waterCompanyCharge: '321.99'
          }
        },
        {
          billableDays: 365,
          createdAt: new Date('2023-02-02'),
          description: '1',
          grossValuesCalculated: {
            baselineCharge: '987',
            supportedSourceCharge: '12345',
            waterCompanyCharge: '6543'
          }
        },
        { billableDays: 20, createdAt: new Date(), description: '2', grossValuesCalculated: {} },
        { billableDays: 365, createdAt: new Date('2023-02-01'), description: '0', grossValuesCalculated: {} }
      ]

      transactions = []
      for (const transactionData of transactionValues) {
        const transaction = await TransactionHelper.add({
          billableDays: transactionData.billableDays,
          billLicenceId: billLicence.id,
          chargeCategoryCode: null,
          chargeReferenceId: chargeReference.id,
          createdAt: transactionData.createdAt,
          description: transactionData.description,
          grossValuesCalculated: transactionData.grossValuesCalculated
        })
        transactions.push(transaction)
      }
    })

    it('returns the matching bill licence and associated data', async () => {
      const result = await FetchBillLicenceService.go(billLicence.id)

      expect(result).to.equal({
        id: billLicence.id,
        licenceId: billLicence.licenceId,
        licenceRef: billLicence.licenceRef,
        bill: {
          id: bill.id,
          accountNumber: bill.accountNumber,
          billRun: {
            id: billRun.id,
            batchType: 'supplementary',
            scheme: 'alcs',
            source: 'wrls',
            status: 'ready'
          }
        },
        transactions: [
          _transactionResult(transactions[3], chargeReference, null, purpose),
          _transactionResult(transactions[1], chargeReference, null, purpose),
          _transactionResult(transactions[2], chargeReference, null, purpose),
          _transactionResult(transactions[0], chargeReference, null, purpose)
        ]
      })
    })
  })

  describe('when a bill licence with a matching ID does not exist', () => {
    it('returns a result with no values set', async () => {
      const result = await FetchBillLicenceService.go('93112100-152b-4860-abea-2adee11dcd69')

      expect(result).to.be.undefined()
    })
  })
})

function _transactionResult(transaction, chargeReference, chargeElements, purpose) {
  const { baselineCharge, supportedSourceCharge, waterCompanyCharge } = transaction.grossValuesCalculated

  const transactionResult = {
    abstractionPeriodEndDay: null,
    abstractionPeriodEndMonth: null,
    abstractionPeriodStartDay: null,
    abstractionPeriodStartMonth: null,
    adjustmentFactor: 1,
    aggregateFactor: 1,
    authorisedDays: 365,
    baselineCharge: baselineCharge ? Number(baselineCharge) : null,
    billableDays: transaction.billableDays,
    chargeCategoryCode: transaction.chargeCategoryCode,
    chargeCategoryDescription: transaction.chargeCategoryDescription,
    chargeReference: { chargeElements: [], id: chargeReference.id, purpose: null },
    chargeType: 'standard',
    credit: false,
    description: transaction.description,
    endDate: new Date('2026-03-31'),
    id: transaction.id,
    loss: 'medium',
    netAmount: null,
    scheme: transaction.scheme,
    season: 'all year',
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: 'false',
    source: 'non-tidal',
    startDate: new Date('2025-04-01'),
    supportedSourceChargeValue: supportedSourceCharge ? Number(supportedSourceCharge) : null,
    supportedSourceName: null,
    volume: 11,
    waterCompanyCharge: false,
    waterCompanyChargeValue: waterCompanyCharge ? Number(waterCompanyCharge) : null,
    winterOnly: false
  }

  if (chargeElements) {
    transactionResult.chargeReference.chargeElements = [
      {
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        authorisedAnnualQuantity: 200,
        id: chargeElements[0].id,
        purpose: {
          description: purpose.description,
          id: purpose.id
        }
      },
      {
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        authorisedAnnualQuantity: 200,
        id: chargeElements[1].id,
        purpose: {
          description: purpose.description,
          id: purpose.id
        }
      }
    ]
  }

  if (chargeReference.purposeId) {
    transactionResult.chargeReference.purpose = { description: purpose.description, id: purpose.id }
  }

  return transactionResult
}

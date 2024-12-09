'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../support/helpers/bill.helper.js')
const BillModel = require('../../app/models/bill.model.js')
const BillLicenceHelper = require('../support/helpers/bill-licence.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const TransactionHelper = require('../support/helpers/transaction.helper.js')
const TransactionModel = require('../../app/models/transaction.model.js')

// Thing under test
const BillLicenceModel = require('../../app/models/bill-licence.model.js')

describe('Bill Licence model', () => {
  let testBill
  let testLicence
  let testRecord
  let testTransactions

  before(async () => {
    // Link bills
    testBill = await BillHelper.add()
    const { id: billId } = testBill

    // Linking licences
    testLicence = await LicenceHelper.add()

    const { id: licenceId } = testLicence

    // Test record
    testRecord = await BillLicenceHelper.add({ billId, licenceId })
    const { id } = testRecord

    // Link transactions
    testTransactions = []
    for (let i = 0; i < 2; i++) {
      const transaction = await TransactionHelper.add({ billLicenceId: id })

      testTransactions.push(transaction)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillLicenceModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillLicenceModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query().innerJoinRelated('bill')

        expect(query).to.exist()
      })

      it('can eager load the bill', async () => {
        const result = await BillLicenceModel.query().findById(testRecord.id).withGraphFetched('bill')

        expect(result).to.be.instanceOf(BillLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.bill).to.be.an.instanceOf(BillModel)
        expect(result.bill).to.equal(testBill)
      })
    })

    describe('when linking to transactions', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query().innerJoinRelated('transactions')

        expect(query).to.exist()
      })

      it('can eager load the transactions', async () => {
        const result = await BillLicenceModel.query().findById(testRecord.id).withGraphFetched('transactions')

        expect(result).to.be.instanceOf(BillLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.transactions).to.be.an.array()
        expect(result.transactions[0]).to.be.an.instanceOf(TransactionModel)
        expect(result.transactions).to.include(testTransactions[0])
        expect(result.transactions).to.include(testTransactions[1])
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await BillLicenceModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await BillLicenceModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(BillLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})

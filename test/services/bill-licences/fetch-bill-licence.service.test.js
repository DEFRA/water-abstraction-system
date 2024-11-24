'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillLicenceModel = require('../../../app/models/bill-licence.model.js')
const BillModel = require('../../../app/models/bill.model.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')
const ChargeElementHelper = require('../../support/helpers/charge-element.helper.js')
const ChargeElementModel = require('../../../app/models/charge-element.model.js')
const ChargeReferenceHelper = require('../../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/charge-reference.model.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const PurposeModel = require('../../../app/models/purpose.model.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')
const TransactionModel = require('../../../app/models/transaction.model.js')

// Thing under test
const FetchBillLicenceService = require('../../../app/services/bill-licences/fetch-bill-licence.service.js')

describe('Fetch Bill Licence service', () => {
  let linkedBill
  let linkedBillRun
  let linkedChargeReference
  let linkedPurpose
  let testBillLicence

  beforeEach(async () => {
    linkedBillRun = await BillRunHelper.add({ status: 'ready' })
    linkedBill = await BillHelper.add({ billRunId: linkedBillRun.id })

    testBillLicence = await BillLicenceHelper.add({ billId: linkedBill.id })
  })

  describe('when a bill licence with a matching ID exists', () => {
    it('will fetch the data and format it for use in the bill licence page', async () => {
      const result = await FetchBillLicenceService.go(testBillLicence.id)

      // NOTE: Transactions would not ordinarily be empty. But the format of the transactions will differ depending on
      // scheme so we get into that in later tests.
      expect(result).to.equal({
        id: testBillLicence.id,
        licenceId: testBillLicence.licenceId,
        licenceRef: testBillLicence.licenceRef,
        bill: {
          id: linkedBill.id,
          accountNumber: linkedBill.accountNumber,
          billRun: {
            id: linkedBillRun.id,
            batchType: 'supplementary',
            scheme: 'sroc',
            source: 'wrls',
            status: 'ready'
          }
        },
        transactions: []
      })
    })

    it('returns the matching instance of BillLicenceModel', async () => {
      const result = await FetchBillLicenceService.go(testBillLicence.id)

      expect(result.id).to.equal(testBillLicence.id)
      expect(result).to.be.an.instanceOf(BillLicenceModel)
    })

    it('returns the linked bill', async () => {
      const result = await FetchBillLicenceService.go(testBillLicence.id)
      const { bill: returnedBill } = result

      expect(returnedBill.id).to.equal(linkedBill.id)
      expect(returnedBill).to.be.an.instanceOf(BillModel)
    })

    it('returns the linked bill run', async () => {
      const result = await FetchBillLicenceService.go(testBillLicence.id)
      const { billRun: returnedBillRun } = result.bill

      expect(returnedBillRun.id).to.equal(linkedBillRun.id)
      expect(returnedBillRun).to.be.an.instanceOf(BillRunModel)
    })

    describe('and it is for an SROC bill run', () => {
      beforeEach(async () => {
        linkedChargeReference = await ChargeReferenceHelper.add()
        linkedPurpose = PurposeHelper.select()

        const { id: chargeReferenceId } = linkedChargeReference

        await Promise.all([
          ChargeElementHelper.add({ chargeReferenceId, purposeId: linkedPurpose.id }),
          ChargeElementHelper.add({ chargeReferenceId, purposeId: linkedPurpose.id })
        ])

        const { id: billLicenceId } = testBillLicence

        await Promise.all([
          TransactionHelper.add({
            billLicenceId,
            chargeReferenceId,
            description: '3',
            chargeCategoryCode: '4.3.1',
            billableDays: 10
          }),
          TransactionHelper.add({
            billLicenceId,
            chargeReferenceId,
            description: '1',
            chargeCategoryCode: '4.3.2',
            createdAt: new Date('2023-02-02')
          }),
          TransactionHelper.add({
            billLicenceId,
            chargeReferenceId,
            description: '2',
            chargeCategoryCode: '4.3.1',
            billableDays: 20
          }),
          TransactionHelper.add({
            billLicenceId,
            chargeReferenceId,
            description: '0',
            chargeCategoryCode: '4.3.2',
            createdAt: new Date('2023-02-01')
          })
        ])
      })

      it('returns the linked transactions correctly ordered', async () => {
        const result = await FetchBillLicenceService.go(testBillLicence.id)
        const { transactions: returnedTransactions } = result

        expect(returnedTransactions).to.have.length(4)
        expect(returnedTransactions[0]).to.be.an.instanceOf(TransactionModel)

        for (let i = 0; i < returnedTransactions.length; i++) {
          expect(returnedTransactions[i].description).to.equal(i.toString())
          expect(returnedTransactions[i]).to.be.an.instanceOf(TransactionModel)
        }
      })

      it('returns the linked transactions, their charge reference, its elements and their purpose', async () => {
        const result = await FetchBillLicenceService.go(testBillLicence.id)
        const { transactions: returnedTransactions } = result

        expect(returnedTransactions).to.have.length(4)
        expect(returnedTransactions[0]).to.be.an.instanceOf(TransactionModel)

        for (let i = 0; i < returnedTransactions.length; i++) {
          const { chargeReference: returnedChargeReference } = returnedTransactions[i]

          expect(returnedChargeReference.id).to.equal(linkedChargeReference.id)
          expect(returnedChargeReference).to.be.an.instanceOf(ChargeReferenceModel)

          const { chargeElements: returnedChargeElements } = returnedChargeReference

          expect(returnedChargeElements).to.have.length(2)
          expect(returnedChargeElements[0]).to.be.an.instanceOf(ChargeElementModel)

          const { purpose: returnedPurpose } = returnedChargeElements[0]

          expect(returnedPurpose.id).to.equal(linkedPurpose.id)
          expect(returnedPurpose).to.be.an.instanceOf(PurposeModel)
        }
      })
    })

    describe('and it is for a PRESROC bill run', () => {
      beforeEach(async () => {
        linkedPurpose = PurposeHelper.select()
        linkedChargeReference = await ChargeReferenceHelper.add({ purposeId: linkedPurpose.id })

        const { id: chargeReferenceId } = linkedChargeReference
        const { id: billLicenceId } = testBillLicence

        await Promise.all([
          TransactionHelper.add({
            billLicenceId,
            chargeReferenceId,
            description: '3',
            chargeCategoryCode: null,
            billableDays: 10
          }),
          TransactionHelper.add({
            billLicenceId,
            chargeReferenceId,
            description: '1',
            chargeCategoryCode: null,
            createdAt: new Date('2023-02-02')
          }),
          TransactionHelper.add({
            billLicenceId,
            chargeReferenceId,
            description: '2',
            chargeCategoryCode: null,
            billableDays: 20
          }),
          TransactionHelper.add({
            billLicenceId,
            chargeReferenceId,
            description: '0',
            chargeCategoryCode: null,
            createdAt: new Date('2023-02-01')
          })
        ])
      })

      it('returns the linked transactions correctly ordered', async () => {
        const result = await FetchBillLicenceService.go(testBillLicence.id)
        const { transactions: returnedTransactions } = result

        expect(returnedTransactions).to.have.length(4)
        expect(returnedTransactions[0]).to.be.an.instanceOf(TransactionModel)

        for (let i = 0; i < returnedTransactions.length; i++) {
          expect(returnedTransactions[i].description).to.equal(i.toString())
          expect(returnedTransactions[i]).to.be.an.instanceOf(TransactionModel)
        }
      })

      it('returns the linked transactions, their charge reference and its purpose', async () => {
        const result = await FetchBillLicenceService.go(testBillLicence.id)
        const { transactions: returnedTransactions } = result

        expect(returnedTransactions).to.have.length(4)
        expect(returnedTransactions[0]).to.be.an.instanceOf(TransactionModel)

        for (let i = 0; i < returnedTransactions.length; i++) {
          const { chargeReference: returnedChargeReference } = returnedTransactions[i]

          expect(returnedChargeReference.id).to.equal(linkedChargeReference.id)
          expect(returnedChargeReference).to.be.an.instanceOf(ChargeReferenceModel)

          const { purpose: returnedPurpose } = returnedChargeReference

          expect(returnedPurpose.id).to.equal(linkedPurpose.id)
          expect(returnedPurpose).to.be.an.instanceOf(PurposeModel)

          const { chargeElements: returnedChargeElements } = returnedChargeReference

          expect(returnedChargeElements).to.be.empty()
        }
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

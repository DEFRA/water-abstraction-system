'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../app/models/water/bill.model.js')
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const BillLicenceModel = require('../../../app/models/water/bill-licence.model.js')
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const PurposeHelper = require('../../support/helpers/water/purpose.helper.js')
const PurposeModel = require('../../../app/models/water/purpose.model.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')
const TransactionModel = require('../../../app/models/water/transaction.model.js')

// Thing under test
const FetchBillLicenceService = require('../../../app/services/bill-licences/fetch-bill-licence.service.js')

describe('Fetch Bill Licence service', () => {
  let linkedBill
  let linkedBillRun
  let linkedChargeReference
  let linkedPurpose
  let testBillLicence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    linkedBillRun = await BillRunHelper.add()
    linkedBill = await BillHelper.add({ billingBatchId: linkedBillRun.billingBatchId })

    testBillLicence = await BillLicenceHelper.add({ billingInvoiceId: linkedBill.billingInvoiceId })
  })

  describe('when a bill licence with a matching ID exists', () => {
    it('returns the matching instance of BillLicenceModel', async () => {
      const result = await FetchBillLicenceService.go(testBillLicence.billingInvoiceLicenceId)

      expect(result.billingInvoiceLicenceId).to.equal(testBillLicence.billingInvoiceLicenceId)
      expect(result).to.be.an.instanceOf(BillLicenceModel)
    })

    it('returns the linked bill', async () => {
      const result = await FetchBillLicenceService.go(testBillLicence.billingInvoiceLicenceId)
      const { bill: returnedBill } = result

      expect(returnedBill.billingInvoiceId).to.equal(linkedBill.billingInvoiceId)
      expect(returnedBill).to.be.an.instanceOf(BillModel)
    })

    it('returns the linked bill run', async () => {
      const result = await FetchBillLicenceService.go(testBillLicence.billingInvoiceLicenceId)
      const { billRun: returnedBillRun } = result.bill

      expect(returnedBillRun.billingBatchId).to.equal(linkedBillRun.billingBatchId)
      expect(returnedBillRun).to.be.an.instanceOf(BillRunModel)
    })

    describe('and it is for an SROC bill run', () => {
      beforeEach(async () => {
        linkedChargeReference = await ChargeReferenceHelper.add()
        linkedPurpose = await PurposeHelper.add()

        const { chargeElementId } = linkedChargeReference
        await Promise.all([
          ChargeElementHelper.add({ chargeElementId, purposeUseId: linkedPurpose.purposeUseId }),
          ChargeElementHelper.add({ chargeElementId, purposeUseId: linkedPurpose.purposeUseId })
        ])

        const { billingInvoiceLicenceId } = testBillLicence

        await Promise.all([
          TransactionHelper.add({
            billingInvoiceLicenceId, chargeElementId, description: '3', chargeCategoryCode: '4.3.1', billableDays: 10
          }),
          TransactionHelper.add({
            billingInvoiceLicenceId, chargeElementId, description: '1', chargeCategoryCode: '4.3.2', createdAt: new Date('2023-02-02')
          }),
          TransactionHelper.add({
            billingInvoiceLicenceId, chargeElementId, description: '2', chargeCategoryCode: '4.3.1', billableDays: 20
          }),
          TransactionHelper.add({
            billingInvoiceLicenceId, chargeElementId, description: '0', chargeCategoryCode: '4.3.2', createdAt: new Date('2023-02-01')
          })
        ])
      })

      it('returns the linked transactions correctly ordered', async () => {
        const result = await FetchBillLicenceService.go(testBillLicence.billingInvoiceLicenceId)
        const { transactions: returnedTransactions } = result

        expect(returnedTransactions).to.have.length(4)
        expect(returnedTransactions[0]).to.be.an.instanceOf(TransactionModel)

        for (let i = 0; i < returnedTransactions.length; i++) {
          expect(returnedTransactions[i].description).to.equal(i.toString())
          expect(returnedTransactions[i]).to.be.an.instanceOf(TransactionModel)
        }
      })

      it('returns the linked transactions, their charge reference, its elements and their purpose', async () => {
        const result = await FetchBillLicenceService.go(testBillLicence.billingInvoiceLicenceId)
        const { transactions: returnedTransactions } = result

        expect(returnedTransactions).to.have.length(4)
        expect(returnedTransactions[0]).to.be.an.instanceOf(TransactionModel)

        for (let i = 0; i < returnedTransactions.length; i++) {
          const { chargeReference: returnedChargeReference } = returnedTransactions[i]
          expect(returnedChargeReference.chargeElementId).to.equal(linkedChargeReference.chargeElementId)
          expect(returnedChargeReference).to.be.an.instanceOf(ChargeReferenceModel)

          const { chargeElements: returnedChargeElements } = returnedChargeReference
          expect(returnedChargeElements).to.have.length(2)
          expect(returnedChargeElements[0]).to.be.an.instanceOf(ChargeElementModel)

          const { purpose: returnedPurpose } = returnedChargeElements[0]
          expect(returnedPurpose.purposeUseId).to.equal(linkedPurpose.purposeUseId)
          expect(returnedPurpose).to.be.an.instanceOf(PurposeModel)
        }
      })
    })

    describe('and it is for a PRESROC bill run', () => {
      beforeEach(async () => {
        linkedPurpose = await PurposeHelper.add()
        linkedChargeReference = await ChargeReferenceHelper.add({ purposeUseId: linkedPurpose.purposeUseId })

        const { chargeElementId } = linkedChargeReference
        const { billingInvoiceLicenceId } = testBillLicence

        await Promise.all([
          TransactionHelper.add({
            billingInvoiceLicenceId, chargeElementId, description: '3', chargeCategoryCode: null, billableDays: 10
          }),
          TransactionHelper.add({
            billingInvoiceLicenceId, chargeElementId, description: '1', chargeCategoryCode: null, createdAt: new Date('2023-02-02')
          }),
          TransactionHelper.add({
            billingInvoiceLicenceId, chargeElementId, description: '2', chargeCategoryCode: null, billableDays: 20
          }),
          TransactionHelper.add({
            billingInvoiceLicenceId, chargeElementId, description: '0', chargeCategoryCode: null, createdAt: new Date('2023-02-01')
          })
        ])
      })

      it('returns the linked transactions correctly ordered', async () => {
        const result = await FetchBillLicenceService.go(testBillLicence.billingInvoiceLicenceId)
        const { transactions: returnedTransactions } = result

        expect(returnedTransactions).to.have.length(4)
        expect(returnedTransactions[0]).to.be.an.instanceOf(TransactionModel)

        for (let i = 0; i < returnedTransactions.length; i++) {
          expect(returnedTransactions[i].description).to.equal(i.toString())
          expect(returnedTransactions[i]).to.be.an.instanceOf(TransactionModel)
        }
      })

      it('returns the linked transactions, their charge reference and its purpose', async () => {
        const result = await FetchBillLicenceService.go(testBillLicence.billingInvoiceLicenceId)
        const { transactions: returnedTransactions } = result

        expect(returnedTransactions).to.have.length(4)
        expect(returnedTransactions[0]).to.be.an.instanceOf(TransactionModel)

        for (let i = 0; i < returnedTransactions.length; i++) {
          const { chargeReference: returnedChargeReference } = returnedTransactions[i]
          expect(returnedChargeReference.chargeElementId).to.equal(linkedChargeReference.chargeElementId)
          expect(returnedChargeReference).to.be.an.instanceOf(ChargeReferenceModel)

          const { purpose: returnedPurpose } = returnedChargeReference
          expect(returnedPurpose.purposeUseId).to.equal(linkedPurpose.purposeUseId)
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

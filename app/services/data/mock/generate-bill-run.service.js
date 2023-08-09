'use strict'

/**
 * Generates a mock bill run based on a real one
 * @module GenerateBillRunService
 */

const BillingBatchModel = require('../../../models/water/billing-batch.model.js')

async function go (id) {
  const realBillingBatch = await _fetchBillingBatch(id)

  if (!realBillingBatch) {
    throw new Error('No matching bill run exists')
  }

  const billRun = _generateBillRun(realBillingBatch)

  return billRun
}

function _generateBillRun (realBillingBatch) {
  const {
    status,
    scheme,
    billRunNumber,
    fromFinancialYearEnding,
    toFinancialYearEnding,
    createdAt,
    netTotal,
    batchType: type,
    transactionFileReference: transactionFile
  } = realBillingBatch

  const { name: region } = realBillingBatch.region

  const billRun = {
    dateCreated: _formatDate(createdAt),
    status,
    region,
    type,
    chargeScheme: scheme === 'sroc' ? 'Current' : 'Old',
    transactionFile,
    billRunNumber,
    financialYear: `${fromFinancialYearEnding} to ${toFinancialYearEnding}`,
    debit: _poundsToPence(netTotal),
    bills: _generateBills(realBillingBatch.billingInvoices)
  }

  return billRun
}

function _formatDate (date) {
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

function _generateBills (billingInvoices) {
  return billingInvoices.map((billingInvoice) => {
    const {
      netAmount,
      billingInvoiceLicences,
      billingInvoiceId: id,
      invoiceAccountNumber: account,
      invoiceNumber: number
    } = billingInvoice

    const {
      address: accountAddress,
      name: contact
    } = _fakeData()

    return {
      id,
      account,
      number,
      accountAddress,
      contact,
      isWaterCompany: billingInvoiceLicences[0].licence.isWaterUndertaker,
      debit: _poundsToPence(netAmount),
      licences: _generateLicences(billingInvoiceLicences)
    }
  })
}

function _generateLicences (billingInvoiceLicences) {
  return billingInvoiceLicences.map((billingInvoiceLicence) => {
    const {
      billingInvoiceLicenceId: id,
      licenceRef: licence,
      billingTransactions
    } = billingInvoiceLicence

    const { name: licenceHolder } = _fakeData()

    return {
      id,
      licence,
      licenceStartDate: billingInvoiceLicence.licence.startDate,
      licenceHolder,
      billableDays: billingInvoiceLicence.billingTransactions[0].billableDays,
      authorisedDays: billingInvoiceLicence.billingTransactions[0].authorisedDays,
      debit: _poundsToPence(billingInvoiceLicence.billingTransactions[0].netAmount),
      transactions: _generateTransactions(billingTransactions)
    }
  })
}

function _generateTransactions (billingTransactions) {
  return billingTransactions.map((billingTransaction) => {
    const {
      chargeType,
      billableDays,
      authorisedDays,
      netAmount,
      billableQuantity: chargeQuantity,
      description: lineDescription,
      startDate,
      endDate,
      chargeCategoryCode,
      grossValuesCalculated,
      chargeCategoryDescription: chargeDescription
    } = billingTransaction

    return {
      type: chargeType === 'standard' ? 'Water abstraction charge' : 'Compensation charge',
      lineDescription,
      billableDays,
      authorisedDays,
      chargeQuantity,
      debit: _poundsToPence(netAmount),
      chargePeriod: `${_formatDate(startDate)} to ${_formatDate(endDate)}`,
      chargeRefNumber: `${chargeCategoryCode} (£${grossValuesCalculated.baselineCharge.toFixed(2)})`,
      chargeDescription,
      // addCharges: ['Supported source earl soham - deben (£186.00)'],
      addCharges: _generateAdditionalCharges(billingTransaction),
      // adjustments: ['Aggregate'],
      adjustments: _generateAdjustments(billingTransaction),
      elements: [{
        id: 0,
        purpose: 'Spray irrigation',
        abstractionPeriod: '1 April to 31 March',
        authorisedQuantity: '80'
      }]
    }
  })
}

function _generateAdditionalCharges (transaction) {
  const additionalCharges = []

  if (transaction.supportedSourceName) {
    additionalCharges.push(`Supported source ${transaction.supportedSourceName} (£${transaction.grossValuesCalculated.supportedSourceCharge.toFixed(2)})`)
  }

  if (transaction.isWaterCompanyCharge) {
    additionalCharges.push('Public Water Supply')
  }

  return additionalCharges
}

function _generateAdjustments (transaction) {
  const adjustments = []

  if (transaction.chargeElement?.adjustments?.aggregate) {
    adjustments.push(`Aggregate factor (${transaction.chargeElement.adjustments.aggregate})`)
  }

  if (transaction.chargeElement?.adjustments?.charge) {
    adjustments.push(`Adjustment factor (${transaction.chargeElement.adjustments.charge})`)
  }

  if (transaction.chargeElement?.adjustments?.s126) {
    adjustments.push(`Abatement factor (${transaction.chargeElement.adjustments.s126})`)
  }

  if (transaction.chargeElement?.adjustments?.s127) {
    adjustments.push('Two-part tariff (0.5)')
  }

  if (transaction.chargeElement?.adjustments?.s130) {
    adjustments.push('Canal and River Trust (0.5)')
  }

  if (transaction.chargeElement?.adjustments?.winter) {
    adjustments.push('Winter discount (0.5)')
  }

  return adjustments
}

function _poundsToPence (amount) {
  return (amount / 100).toFixed(2)
}

function _fakeData () {
  return {
    address: [
      '123 Fakerton Street',
      'Fakesville',
      'FA12 3KE'
    ],
    name: 'Fakey McFakeface'
  }
}

async function _fetchBillingBatch (id) {
  return BillingBatchModel.query()
    .findById(id)
    .withGraphFetched('region')
    .withGraphFetched('billingInvoices')
    .withGraphFetched('billingInvoices.billingInvoiceLicences')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.licence')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions')
}

module.exports = {
  go
}

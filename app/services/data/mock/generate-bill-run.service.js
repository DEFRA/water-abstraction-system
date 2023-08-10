'use strict'

/**
 * Generates a mock bill run based on a real one
 * @module GenerateBillRunService
 */

const BillingBatchModel = require('../../../models/water/billing-batch.model.js')
const GenerateMockDataService = require('./generate-mock-data.service.js')

async function go (id) {
  const realBillingBatch = await _fetchBillingBatch(id)

  if (!realBillingBatch) {
    throw new Error('No matching bill run exists')
  }

  const billRun = _mapBillingBatch(realBillingBatch)

  return billRun
}

function _mapBillingBatch (realBillingBatch) {
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
    debit: _formatPenceToPounds(netTotal),
    bills: _mapBillingInvoices(realBillingBatch.billingInvoices)
  }

  return billRun
}

function _formatDate (date) {
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

function _mapBillingInvoices (billingInvoices) {
  return billingInvoices.map((billingInvoice) => {
    const {
      billingInvoiceLicences,
      creditNoteValue,
      invoiceValue,
      netAmount,
      billingInvoiceId: id,
      invoiceAccountNumber: account,
      invoiceNumber: number
    } = billingInvoice

    const {
      address: accountAddress,
      name: contact
    } = GenerateMockDataService.go()

    return {
      id,
      account,
      number,
      accountAddress,
      contact,
      isWaterCompany: billingInvoiceLicences[0].licence.isWaterUndertaker,
      credit: _formatPenceToPounds(creditNoteValue),
      debit: _formatPenceToPounds(invoiceValue),
      netTotal: _formatPenceToPounds(netAmount),
      licences: _mapBillingInvoiceLicences(billingInvoiceLicences)
    }
  })
}

function _mapBillingInvoiceLicences (billingInvoiceLicences) {
  return billingInvoiceLicences.map((billingInvoiceLicence) => {
    const {
      billingInvoiceLicenceId: id,
      licenceRef: licence,
      billingTransactions
    } = billingInvoiceLicence

    const { name: licenceHolder } = GenerateMockDataService.go()
    const transactionTotals = _transactionTotals(billingTransactions)

    return {
      id,
      licence,
      licenceStartDate: billingInvoiceLicence.licence.startDate,
      licenceHolder,
      credit: _formatPenceToPounds(transactionTotals.credit),
      debit: _formatPenceToPounds(transactionTotals.debit),
      netTotal: _formatPenceToPounds(transactionTotals.netTotal),
      transactions: _mapBillingTransactions(billingTransactions)
    }
  })
}

function _mapBillingTransactions (billingTransactions) {
  return billingTransactions.map((billingTransaction) => {
    const {
      chargeType,
      billableDays,
      authorisedDays,
      isCredit,
      netAmount,
      billableQuantity: chargeQuantity,
      description: lineDescription,
      startDate,
      endDate,
      chargeCategoryCode,
      grossValuesCalculated,
      chargeCategoryDescription: chargeDescription,
      chargeElement
    } = billingTransaction

    return {
      type: chargeType === 'standard' ? 'Water abstraction charge' : 'Compensation charge',
      lineDescription,
      billableDays,
      authorisedDays,
      chargeQuantity,
      credit: isCredit ? _formatPenceToPounds(netAmount) : '0.00',
      debit: isCredit ? '0.00' : _formatPenceToPounds(netAmount),
      chargePeriod: `${_formatDate(startDate)} to ${_formatDate(endDate)}`,
      chargeRefNumber: `${chargeCategoryCode} (£${grossValuesCalculated.baselineCharge.toFixed(2)})`,
      chargeDescription,
      addCharges: _formatAdditionalCharges(billingTransaction),
      adjustments: _formatAdjustments(chargeElement),
      elements: _mapChargePurposes(chargeElement.chargePurposes)
    }
  })
}

function _mapChargePurposes (chargePurposes) {
  return chargePurposes.map((chargePurpose) => {
    const {
      chargePurposeId: id,
      purposesUse,
      authorisedAnnualQuantity: authorisedQuantity
    } = chargePurpose

    return {
      id,
      purpose: purposesUse.description,
      abstractionPeriod: _formatAbstractionPeriod(chargePurpose),
      authorisedQuantity
    }
  })
}

function _transactionTotals (transactions) {
  const values = {
    debit: 0,
    credit: 0,
    netTotal: 0
  }

  transactions.forEach((transaction) => {
    if (transaction.isCredit) {
      values.credit += transaction.netAmount
    } else {
      values.debit += transaction.netAmount
    }

    values.netTotal += transaction.netAmount
  })

  return values
}

/**
 * Format the start and end abstraction details into their string variant, for example, '1 April to 31 October'
 */
function _formatAbstractionPeriod (chargePurpose) {
  const { abstractionPeriodStartDay, abstractionPeriodStartMonth, abstractionPeriodEndDay, abstractionPeriodEndMonth } = chargePurpose

  const startDate = _formatAbstractionDate(abstractionPeriodStartMonth, abstractionPeriodStartDay)
  const endDate = _formatAbstractionDate(abstractionPeriodEndMonth, abstractionPeriodEndDay)

  return `${startDate} to ${endDate}`
}

/**
 * Formats an abstraction day and month into its string variant, for example, 1 and 4 becomes '1 April'
 */
function _formatAbstractionDate (abstractionDay, abstractionMonth) {
  // NOTE: Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
  // January is actually 0, February is 1 etc. This is why we are always deducting 1 from the months.
  const abstractionDate = new Date(1970, abstractionMonth - 1, abstractionDay)

  return abstractionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

function _formatAdditionalCharges (transaction) {
  const formattedData = []

  const { grossValuesCalculated, isWaterCompanyCharge, supportedSourceName } = transaction

  if (supportedSourceName) {
    const formattedSupportedSourceCharge = _formatNumber(grossValuesCalculated.supportedSourceCharge)
    formattedData.push(`Supported source ${supportedSourceName} (£${formattedSupportedSourceCharge})`)
  }

  if (isWaterCompanyCharge) {
    formattedData.push('Public Water Supply')
  }

  return formattedData
}

/**
 * Format a number to always include 2 decimals, for example, 1564 becomes '1564.00'
 */
function _formatNumber (value) {
  return value.toFixed(2)
}

function _formatAdjustments (chargeElement) {
  const formattedData = []

  if (!chargeElement.adjustments) {
    return formattedData
  }

  const { aggregate, charge, s126, s127, s130, winter } = chargeElement.adjustments

  if (aggregate) {
    formattedData.push(`Aggregate factor (${aggregate})`)
  }

  if (charge) {
    formattedData.push(`Adjustment factor (${charge})`)
  }

  if (s126) {
    formattedData.push(`Abatement factor (${s126})`)
  }

  if (s127) {
    formattedData.push('Two-part tariff (0.5)')
  }

  if (s130) {
    formattedData.push('Canal and River Trust (0.5)')
  }

  if (winter) {
    formattedData.push('Winter discount (0.5)')
  }

  return formattedData
}

/**
 * Format a value from pounds to pence with 2 decimals, for example 156400 becomes 1564.00
 *
 * Most finance values are held as pence in the DB but the UI always displays them in pounds and pence. If a value
 *
 */
function _formatPenceToPounds (value) {
  return _formatNumber(value / 100)
}

async function _fetchBillingBatch (id) {
  return BillingBatchModel.query()
    .findById(id)
    .withGraphFetched('region')
    .withGraphFetched('billingInvoices')
    .withGraphFetched('billingInvoices.billingInvoiceLicences')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.licence')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement.chargePurposes')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement.chargePurposes.purposesUse')
}

module.exports = {
  go
}

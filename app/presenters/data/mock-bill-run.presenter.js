'use strict'

/**
 * Formats the response for the GET `/data/mock/{bill-run}` endpoint
 * @module MockBillRunPresenter
 */

const { formatAbstractionPeriod, formatLongDate, formatPounds } = require('../base.presenter.js')

function go (billRun) {
  const {
    bills,
    billRunNumber,
    createdAt,
    fromFinancialYearEnding,
    netTotal,
    region,
    status,
    scheme,
    toFinancialYearEnding,
    batchType: type,
    transactionFileReference: transactionFile
  } = billRun

  return {
    dateCreated: formatLongDate(createdAt),
    status,
    region: region.name,
    type,
    chargeScheme: scheme === 'sroc' ? 'Current' : 'Old',
    transactionFile,
    billRunNumber,
    financialYear: `${fromFinancialYearEnding} to ${toFinancialYearEnding}`,
    debit: formatPounds(netTotal),
    bills: _formatBills(bills)
  }
}

function _formatAdditionalCharges (transaction) {
  const formattedData = []

  const { grossValuesCalculated, isWaterCompanyCharge, supportedSourceName } = transaction

  if (supportedSourceName) {
    const formattedSupportedSourceCharge = formatPounds(grossValuesCalculated.supportedSourceCharge * 100, true)
    formattedData.push(`Supported source ${supportedSourceName} (£${formattedSupportedSourceCharge})`)
  }

  if (isWaterCompanyCharge) {
    formattedData.push('Public Water Supply')
  }

  return formattedData
}

function _formatAdjustments (chargeReference) {
  const formattedData = []

  if (!chargeReference.adjustments) {
    return formattedData
  }

  const { aggregate, charge, s126, s127, s130, winter } = chargeReference.adjustments

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

function _formatBills (bills) {
  return bills.map((bill) => {
    const {
      accountAddress,
      billLicences,
      contact,
      creditNoteValue,
      invoiceValue,
      netAmount,
      billingInvoiceId: id,
      invoiceAccountNumber: account,
      invoiceNumber: number
    } = bill

    return {
      id,
      account,
      number,
      accountAddress,
      contact,
      isWaterCompany: billLicences[0].licence.isWaterUndertaker,
      credit: formatPounds(creditNoteValue),
      debit: formatPounds(invoiceValue),
      netTotal: formatPounds(netAmount),
      licences: _formatBillLicences(billLicences)
    }
  })
}

function _formatBillLicences (billLicences) {
  return billLicences.map((billLicence) => {
    const {
      transactions,
      credit,
      debit,
      netTotal,
      licenceHolder,
      billingInvoiceLicenceId: id,
      licenceRef: licence
    } = billLicence

    return {
      id,
      licence,
      licenceStartDate: billLicence.licence.startDate,
      licenceHolder,
      credit: formatPounds(credit),
      debit: formatPounds(debit),
      netTotal: formatPounds(netTotal),
      transactions: _formatTransactions(transactions)
    }
  })
}

function _formatTransactions (transactions) {
  return transactions.map((transaction) => {
    const {
      authorisedDays,
      billableDays,
      chargeCategoryCode,
      chargeReference,
      chargeType,
      endDate,
      grossValuesCalculated,
      isCredit,
      netAmount,
      startDate,
      billableQuantity: chargeQuantity,
      chargeCategoryDescription: chargeDescription,
      description: lineDescription
    } = transaction

    return {
      type: chargeType === 'standard' ? 'Water abstraction charge' : 'Compensation charge',
      lineDescription,
      billableDays,
      authorisedDays,
      chargeQuantity,
      credit: isCredit ? formatPounds(netAmount) : '0.00',
      debit: isCredit ? '0.00' : formatPounds(netAmount),
      chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      chargeRefNumber: `${chargeCategoryCode} (£${formatPounds(grossValuesCalculated.baselineCharge * 100, true)})`,
      chargeDescription,
      addCharges: _formatAdditionalCharges(transaction),
      adjustments: _formatAdjustments(chargeReference),
      elements: _formatChargeElements(chargeReference.chargeElements)
    }
  })
}

function _formatChargeElements (chargeElements) {
  return chargeElements.map((chargeElement) => {
    const {
      purpose,
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth,
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth,
      authorisedAnnualQuantity: authorisedQuantity,
      chargePurposeId: id
    } = chargeElement

    return {
      id,
      purpose: purpose.description,
      abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
      authorisedQuantity
    }
  })
}

module.exports = {
  go
}

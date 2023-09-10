'use strict'

/**
 * Formats the response for the GET `/data/mock/{bill-run}` endpoint
 * @module MockBillRunPresenter
 */

const { convertPenceToPounds, formatAbstractionPeriod, formatLongDate, formatNumberAsMoney } = require('../base.presenter.js')

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
    debit: formatNumberAsMoney(convertPenceToPounds(netTotal)),
    bills: _formatBills(bills)
  }
}

function _formatAdditionalCharges (transaction) {
  const formattedData = []

  const { grossValuesCalculated, isWaterCompanyCharge, supportedSourceName } = transaction

  if (supportedSourceName) {
    const formattedSupportedSourceCharge = formatNumberAsMoney(grossValuesCalculated.supportedSourceCharge, true)
    formattedData.push(`Supported source ${supportedSourceName} (${formattedSupportedSourceCharge})`)
  }

  if (isWaterCompanyCharge) {
    formattedData.push('Public Water Supply')
  }

  return formattedData
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
      credit: formatNumberAsMoney(convertPenceToPounds(creditNoteValue)),
      debit: formatNumberAsMoney(convertPenceToPounds(invoiceValue)),
      netTotal: formatNumberAsMoney(convertPenceToPounds(netAmount)),
      licences: _formatBillLicences(billLicences)
    }
  })
}

function _formatBillLicences (billLicences) {
  return billLicences.map((billLicence) => {
    const {
      billingTransactions,
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
      credit: formatNumberAsMoney(convertPenceToPounds(credit)),
      debit: formatNumberAsMoney(convertPenceToPounds(debit)),
      netTotal: formatNumberAsMoney(convertPenceToPounds(netTotal)),
      transactions: _formatBillingTransactions(billingTransactions)
    }
  })
}

function _formatBillingTransactions (billingTransactions) {
  return billingTransactions.map((billingTransaction) => {
    const {
      authorisedDays,
      billableDays,
      chargeCategoryCode,
      chargeElement,
      chargeType,
      endDate,
      grossValuesCalculated,
      isCredit,
      netAmount,
      startDate,
      billableQuantity: chargeQuantity,
      chargeCategoryDescription: chargeDescription,
      description: lineDescription
    } = billingTransaction

    return {
      type: chargeType === 'standard' ? 'Water abstraction charge' : 'Compensation charge',
      lineDescription,
      billableDays,
      authorisedDays,
      chargeQuantity,
      credit: isCredit ? formatNumberAsMoney(convertPenceToPounds(netAmount)) : '0.00',
      debit: isCredit ? '0.00' : formatNumberAsMoney(convertPenceToPounds(netAmount)),
      chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      chargeRefNumber: `${chargeCategoryCode} (${formatNumberAsMoney(grossValuesCalculated.baselineCharge, true)})`,
      chargeDescription,
      addCharges: _formatAdditionalCharges(billingTransaction),
      adjustments: _formatAdjustments(chargeElement),
      elements: _formatChargePurposes(chargeElement.chargePurposes)
    }
  })
}

function _formatChargePurposes (chargePurposes) {
  return chargePurposes.map((chargePurpose) => {
    const {
      purposesUse,
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth,
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth,
      authorisedAnnualQuantity: authorisedQuantity,
      chargePurposeId: id
    } = chargePurpose

    return {
      id,
      purpose: purposesUse.description,
      abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
      authorisedQuantity
    }
  })
}

module.exports = {
  go
}

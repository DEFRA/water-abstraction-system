'use strict'

/**
 * Formats summary data of bills connected to a bill run for the bill run summary page
 * @module ViewBillSummariesPresenter
 */

const { formatMoney } = require('../base.presenter.js')

function go (billSummaries) {
  const waterCompanies = _waterCompanies(billSummaries)
  const otherAbstractors = _otherAbstractors(billSummaries)

  const billGroups = []

  if (waterCompanies.length > 0) {
    billGroups.push({
      type: 'water-companies',
      caption: _caption(waterCompanies, true),
      bills: _bills(waterCompanies),
      total: _total(waterCompanies)
    })
  }

  if (otherAbstractors.length > 0) {
    billGroups.push({
      type: 'other-abstractors',
      caption: _caption(otherAbstractors, false),
      bills: _bills(otherAbstractors),
      total: _total(otherAbstractors)
    })
  }

  return billGroups
}

function _bills (summaries) {
  return summaries.map((summary) => {
    const {
      agentName,
      allLicences,
      billingInvoiceId,
      companyName,
      financialYearEnding,
      invoiceAccountNumber,
      netAmount
    } = summary

    const licences = allLicences.split(',')

    return {
      id: billingInvoiceId,
      accountNumber: invoiceAccountNumber,
      billingContact: _billingContact(agentName, companyName),
      licences,
      licencesCount: licences.length,
      financialYear: financialYearEnding,
      total: formatMoney(netAmount, true)
    }
  })
}

function _billingContact (agentName, companyName) {
  if (agentName) {
    return agentName
  }

  return companyName
}

function _caption (bills, isWaterCompany) {
  const numberOfRows = bills.length

  if (numberOfRows === 1) {
    return isWaterCompany ? '1 water company' : '1 other abstractor'
  }

  return isWaterCompany ? `${numberOfRows} water companies` : `${numberOfRows} other abstractors`
}

function _otherAbstractors (summaries) {
  return summaries.filter((summary) => {
    return !summary.waterCompany
  })
}

function _waterCompanies (summaries) {
  return summaries.filter((summary) => {
    return summary.waterCompany
  })
}

function _total (billSummaries) {
  const total = billSummaries.reduce((total, billSummary) => {
    return total + billSummary.netAmount
  }, 0)

  return formatMoney(total, true)
}

module.exports = {
  go
}

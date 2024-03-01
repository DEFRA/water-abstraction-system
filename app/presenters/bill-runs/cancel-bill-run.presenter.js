'use strict'

/**
 * Formats the bill run data ready for presenting in the cancel bill run confirmation page
 * @module CancelBillRunPresenter
 */

const { capitalize, formatLongDate } = require('../base.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 *
 * @returns {Object} - the prepared bill run data to be passed to the cancel bill run confirmation page
 */
function go (billRun) {
  const {
    batchType,
    billRunNumber,
    createdAt,
    id,
    region,
    scheme,
    status,
    summer,
    toFinancialYearEnding
  } = billRun

  return {
    backLink: _backLink(id, status),
    billRunId: id,
    billRunNumber,
    billRunStatus: status,
    billRunType: _billRunType(batchType, summer, scheme),
    chargeScheme: _chargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: _financialYear(toFinancialYearEnding),
    region: capitalize(region.displayName)
  }
}

function _backLink (id, status) {
  if (status === 'review') {
    return `/system/bill-runs/${id}/review`
  }

  return `/system/bill-runs/${id}`
}

function _billRunType (batchType, summer, scheme) {
  if (batchType !== 'two_part_tariff') {
    return capitalize(batchType)
  }

  if (scheme === 'sroc') {
    return 'Two-part tariff'
  }

  if (summer) {
    return 'Two-part tariff summer'
  }

  return 'Two-part tariff winter and all year'
}

function _chargeScheme (scheme) {
  if (scheme === 'sroc') {
    return 'Current'
  }

  return 'Old'
}

function _financialYear (financialYearEnding) {
  return `${financialYearEnding - 1} to ${financialYearEnding}`
}

module.exports = {
  go
}

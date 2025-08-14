'use strict'

/**
 * Formats the bill run data ready for presenting in the errored bill run page
 * @module ErroredBillRunPresenter
 */

const { formatFinancialYear, formatLongDate, titleCase } = require('../base.presenter.js')
const { formatBillRunType, formatChargeScheme, generateBillRunTitle } = require('../billing.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 *
 * @returns {object} - the prepared bill run data to be passed to the errored bill run page
 */
function go(billRun) {
  const { batchType, billRunNumber, createdAt, errorCode, id, region, scheme, status, summer, toFinancialYearEnding } =
    billRun

  return {
    backLink: '/system/bill-runs',
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    buttonLink: `/system/bill-runs/${id}/cancel`,
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    errorMessage: _errorMessage(errorCode),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    pageTitle: generateBillRunTitle(region.displayName, batchType, scheme, summer),
    region: titleCase(region.displayName)
  }
}

function _errorMessage(errorCode) {
  const errors = [
    { code: 10, message: 'Error when populating the charge versions.' },
    { code: 20, message: 'Error when processing the charge versions.' },
    { code: 30, message: 'Error when preparing the transactions.' },
    { code: 40, message: 'Error when requesting or processing a transaction charge.' },
    { code: 50, message: 'Error when creating the Charging Module bill run.' },
    { code: 60, message: 'Error when deleting an invoice.' },
    { code: 70, message: 'Error when processing two-part tariff.' },
    { code: 80, message: 'Error when getting the Charging Module bill run summary.' },
    { code: 90, message: 'Error when re-billing a bill run.' }
  ]

  const matchingError = errors.find((error) => {
    return error.code === errorCode
  })

  if (matchingError) {
    return matchingError.message
  }

  return 'No error code was assigned. We have no further information at this time.'
}

module.exports = {
  go
}

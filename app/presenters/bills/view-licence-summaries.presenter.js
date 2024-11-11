'use strict'

/**
 * Formats summary data of licences connected to a bill for the multi-licence bill page
 * @module ViewLicenceSummariesPresenter
 */

const { formatMoney } = require('../base.presenter.js')

/**
 * Formats summary data of licences connected to a bill for the multi-licence bill page
 *
 * @param {object[]} licenceSummaries - an array of licence summaries
 *
 * @returns {object} a formatted representation of the bill's licence summaries
 */
function go (licenceSummaries) {
  const billLicences = _billLicences(licenceSummaries)

  const formattedBill = {
    billLicences,
    tableCaption: _tableCaption(billLicences)
  }

  return formattedBill
}

function _billLicences(licenceSummaries) {
  return licenceSummaries.map((licenceSummary) => {
    const { id, licenceRef: reference, total } = licenceSummary

    return {
      id,
      reference,
      total: formatMoney(total, true)
    }
  })
}

function _tableCaption(billLicences) {
  const numberOfRows = billLicences.length

  if (numberOfRows === 1) {
    return '1 licence'
  }

  return `${numberOfRows} licences`
}

module.exports = {
  go
}

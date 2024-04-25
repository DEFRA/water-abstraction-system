'use strict'

/**
 * Formats the data ready for presenting in the remove bill run licence confirmation page
 * @module RemoveBillRunLicencePresenter
 */

const { capitalize, formatFinancialYear } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 * @param {Object[]} licence - an array containing the licence id, ref & account number. For the majority of licences
 * the array will normally contain only one element, however licences can have multiple billing accounts.
 *
 * @returns {Object} - the prepared data to be passed to the remove licence template
 */
function go (billRun, licence) {
  const { region, toFinancialYearEnding } = billRun

  return {
    backLink: `../review/${licence[0].licenceId}`,
    billingAccount: _billingAccount(licence),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    licenceRef: licence[0].licenceRef,
    region: capitalize(region)
  }
}

function _billingAccount (licence) {
  if (licence.length > 1) {
    const accountNumbers = licence.map(licence => {
      return licence.accountNumber
    })

    return accountNumbers.join(', ')
  } else {
    return licence[0].accountNumber
  }
}

module.exports = {
  go
}

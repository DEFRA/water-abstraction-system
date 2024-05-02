'use strict'

/**
 * Formats the data ready for presenting in the remove bill run licence confirmation page
 * @module RemoveBillRunLicencePresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')

/**
 * Formats the data ready for presenting in the remove bill run licence confirmation page
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 * @param {Object[]} licence - an array containing the licence id, ref & account number for a single licence. For the
 * majority of licences the array will normally contain only one element. However, licences can have multiple billing
 * accounts so more than one element can exist for a licence.
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
    region
  }
}

function _billingAccount (licence) {
  if (licence.length > 1) {
    const accountNumbers = licence.map(element => {
      return element.accountNumber
    })

    return accountNumbers.join(', ')
  } else {
    return licence[0].accountNumber
  }
}

module.exports = {
  go
}

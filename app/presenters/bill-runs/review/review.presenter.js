'use strict'

/**
 * Formats data for the `/bill-runs/review/{id}` page
 * @module ReviewBillRunPresenter
 */

const { formatFinancialYear, formatLongDate, titleCase } = require('../../base.presenter.js')
const { formatBillRunType, formatChargeScheme, generateBillRunTitle } = require('../../billing.presenter.js')

/**
 * Formats data for the `/bill-runs/review/{id}` page
 *
 * @param {module:BillRunModel} billRun - The data from the bill run
 * @param {module:LicenceModel} licences - The licences data associated with the bill run
 *
 * @returns {object} - The data formatted for the view template
 */
function go(billRun, licences) {
  const formattedLicences = _formatLicences(licences)

  const {
    batchType,
    createdAt,
    id: billRunId,
    region,
    reviewLicences,
    scheme,
    status,
    summer,
    toFinancialYearEnding
  } = billRun

  return {
    backLink: { href: '/system/bill-runs', text: 'Go back to bill runs' },
    billRunId,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    licences: formattedLicences,
    numberOfLicencesToReview: reviewLicences[0].numberOfLicencesToReview,
    pageTitle: 'Review licences',
    pageTitleCaption: generateBillRunTitle(region.displayName, batchType, scheme, summer),
    region: titleCase(region.displayName),
    reviewMessage: _reviewMessage(reviewLicences[0].numberOfLicencesToReview),
    status
  }
}

function _issue(issues) {
  // if there is more than one issue the issues will be separated by a comma
  if (issues.includes(',')) {
    return 'Multiple Issues'
  }

  return issues
}

function _formatLicences(licences) {
  return licences.map((licence) => {
    return {
      id: licence.id,
      licenceRef: licence.licenceRef,
      licenceHolder: licence.licenceHolder,
      issue: _issue(licence.issues),
      progress: licence.progress ? '✓' : '',
      status: licence.status
    }
  })
}

function _reviewMessage(numberOfLicencesToReview) {
  let numberOfLicences

  if (numberOfLicencesToReview === 0) {
    return 'You have resolved all returns data issues. Continue to generate bills.'
  } else if (numberOfLicencesToReview === 1) {
    numberOfLicences = '1 licence'
  } else {
    numberOfLicences = `${numberOfLicencesToReview} licences`
  }

  return `You need to review ${numberOfLicences} with returns data issues. You can then continue and send the bill run.`
}

module.exports = {
  go
}

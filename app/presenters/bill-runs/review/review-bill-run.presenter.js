'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the review page
 * @module ReviewBillRunPresenter
 */

const { formatLongDate, generateBillRunTitle } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run, licence and filter data for presentation
 *
 * @param {module:BillRunModel} billRun - The data from the bill run
 * @param {{Object[]}} filterIssues - An array of issues to filter the results by. This will only contain data when
 * there is a POST request, which only occurs when a filter is applied to the results. NOTE: if there is only a single
 * issue this will be a string, not an array
 * @param {string} filterLicenceHolderNumber - The licence holder or licence number to filter the results by. This will
 * only contain data when there is a POST request, which only occurs when a filter is applied to the results.
 * @param {string} filterLicenceStatus - The status of the licence to filter the results by. This also only contains
 * data when there is a POST request.
 * @param {string} filterProgress - The progress of the licence to filter the results by. This also only contains data
 * when there is a POST request.
 * @param {module:LicenceModel} licences - The licences data associated with the bill run
 *
 * @returns {object} The prepared bill run,licence and filter data to be passed to the review page
 */
function go(billRun, filterIssues, filterLicenceHolderNumber, filterLicenceStatus, filterProgress, licences) {
  const preparedLicences = _prepareLicences(licences)

  const preparedBillRun = _prepareBillRun(billRun, preparedLicences)

  const issues = filterIssues ? _prepareIssues(filterIssues) : filterIssues

  const filter = {
    issues,
    licenceHolderNumber: filterLicenceHolderNumber,
    licenceStatus: filterLicenceStatus,
    inProgress: filterProgress
  }

  // this opens the filter on the page if any filter data has been received so the user can see the applied filters
  filter.openFilter = (filterIssues || filterLicenceHolderNumber || filterLicenceStatus || filterProgress) !== undefined

  return { ...preparedBillRun, preparedLicences, filter }
}

/**
 * Returns true/false values for each issue in the Issue filter based on the filters applied to determine which
 * checkboxes if any should be checked upon loading the page
 *
 * @private
 */
function _prepareIssues(filterIssues) {
  return {
    absOutsidePeriod: filterIssues.includes('abs-outside-period'),
    aggregateFactor: filterIssues.includes('aggregate-factor'),
    checkingQuery: filterIssues.includes('checking-query'),
    multipleIssues: filterIssues.includes('multiple-issues'),
    noIssues: filterIssues.includes('no-issues'),
    noReturnsReceived: filterIssues.includes('no-returns-received'),
    overAbstraction: filterIssues.includes('over-abstraction'),
    overlapOfChargeDates: filterIssues.includes('overlap-of-charge-dates'),
    returnsReceivedNotProcessed: filterIssues.includes('returns-received-not-processed'),
    returnsLate: filterIssues.includes('returns-late'),
    returnSplitOverRefs: filterIssues.includes('return-split-over-refs'),
    someReturnsNotReceived: filterIssues.includes('some-returns-not-received'),
    unableToMatchReturn: filterIssues.includes('unable-to-match-return')
  }
}

function _prepareLicences(licences) {
  const preparedLicences = []

  for (const licence of licences) {
    preparedLicences.push({
      id: licence.id,
      licenceRef: licence.licenceRef,
      licenceHolder: licence.licenceHolder,
      issue: _getIssueOnLicence(licence.issues),
      progress: licence.progress ? '✓' : '',
      status: licence.status
    })
  }

  return preparedLicences
}

function _prepareBillRun(billRun, preparedLicences) {
  return {
    billRunId: billRun.id,
    billRunTitle: generateBillRunTitle(billRun.region.displayName, billRun.batchType, billRun.scheme, billRun.summer),
    billRunType: 'two-part tariff',
    dateCreated: formatLongDate(billRun.createdAt),
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    numberOfLicencesDisplayed: preparedLicences.length,
    numberOfLicencesToReview: billRun.reviewLicences[0].numberOfLicencesToReview,
    region: billRun.region.displayName,
    reviewMessage: _prepareReviewMessage(billRun.reviewLicences[0].numberOfLicencesToReview),
    status: billRun.status,
    totalNumberOfLicences: billRun.reviewLicences[0].totalNumberOfLicences
  }
}

function _prepareReviewMessage(numberOfLicencesToReview) {
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

function _financialYear(financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _getIssueOnLicence(issues) {
  // if there is more than one issue the issues will be separated by a comma
  if (issues.includes(',')) {
    return 'Multiple Issues'
  }

  return issues
}

module.exports = {
  go
}

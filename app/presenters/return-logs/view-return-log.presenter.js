'use strict'

/**
 * Formats return log data ready for presenting in the view return log page
 * @module ViewReturnLogPresenter
 */

const {
  formatAbstractionPeriod,
  formatLongDate,
  formatNumber,
  formatPurposes,
  formatReturnLogStatus
} = require('../base.presenter.js')
const {
  formatMeterDetails,
  generateSummaryTableHeaders,
  generateSummaryTableRows
} = require('./base-return-logs.presenter.js')
const { today } = require('../../lib/general.lib.js')
const { returnRequirementFrequencies, unitNames } = require('../../lib/static-lookups.lib.js')

/**
 * Formats return log data ready for presenting in the view return log page
 *
 * @param {module:ReturnLogModel} returnLog - The return log and associated submission and licence data
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} page data needed by the view template
 */
function go(returnLog, auth) {
  const {
    endDate,
    id,
    licence,
    purposes,
    receivedDate,
    returnReference,
    returnsFrequency,
    returnSubmissions,
    siteDescription,
    startDate,
    twoPartTariff,
    underQuery,
    versions
  } = returnLog

  const selectedReturnSubmission = _selectedReturnSubmission(returnSubmissions)
  const latest = _latest(versions, selectedReturnSubmission)

  const method = selectedReturnSubmission?.$method()
  const units = selectedReturnSubmission?.$units()
  const formattedStatus = formatReturnLogStatus(returnLog)
  const summaryTableData = _summaryTableData(selectedReturnSubmission, returnsFrequency)

  return {
    abstractionPeriod: _abstractionPeriod(returnLog),
    actionButton: _actionButton(latest, auth, returnLog, formattedStatus),
    backLink: _backLink(returnLog.id, licence.id, latest),
    displayReadings: method !== 'abstractionVolumes',
    displayTable: _displayTable(selectedReturnSubmission),
    displayTotal: !!selectedReturnSubmission,
    displayUnits: units !== unitNames.CUBIC_METRES,
    downloadCSVLink: _downloadCSVLink(selectedReturnSubmission, id),
    meterDetails: formatMeterDetails(selectedReturnSubmission?.$meter()),
    method,
    nilReturn: selectedReturnSubmission ? selectedReturnSubmission.nilReturn : false,
    pageTitle: 'Abstraction return',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    purpose: formatPurposes(purposes),
    receivedDate: receivedDate ? formatLongDate(receivedDate) : null,
    returnReference,
    returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    showUnderQuery: formattedStatus !== 'not due yet',
    siteDescription,
    startReading: _startReading(selectedReturnSubmission),
    status: formattedStatus,
    summaryTableData,
    tableTitle: _tableTitle(summaryTableData, returnsFrequency, method),
    tariff: twoPartTariff ? 'Two-part' : 'Standard',
    total: _total(selectedReturnSubmission),
    underQuery,
    versions: _versions(selectedReturnSubmission, versions, id),
    warning: _warning(formattedStatus, latest)
  }
}

/**
 * Extracts and formats the abstraction period from the return log
 *
 * If the abstraction period start day is not defined or is 'null', it returns an empty string. Otherwise, it formats
 * the abstraction period using the start and end day/month values.
 *
 * We have found there are approximately 2K return requirements that were imported from NALD with no abstraction period
 * set. This means any return logs generated from them won't have any proper values in their `metadata.nald` object.
 *
 * This means we need this additional logic to handle these problem records. We show a blank on the page to indicate to
 * the user there is a problem with this return log's abstraction period.
 *
 * @param {object} returnLog - The return log to extract the abstraction period from
 *
 * @returns {string} The formatted abstraction period or an empty string if not available
 */

function _abstractionPeriod(returnLog) {
  const { periodEndDay, periodEndMonth, periodStartDay, periodStartMonth } = returnLog

  if (!periodStartDay || periodStartDay === 'null') {
    return ''
  }

  return formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth)
}

function _actionButton(latest, auth, returnLog, formattedStatus) {
  const { endDate, id: returnLogId } = returnLog

  // You cannot edit a previous version
  if (!latest) {
    return null
  }

  // You cannot edit a void return or a return that hasn't ended
  if (formattedStatus === 'void' || today() <= endDate) {
    return null
  }

  // You cannot submit or edit if you do not have permission to
  if (!auth.credentials.scope.includes('returns')) {
    return null
  }

  // You can only edit a completed return
  if (formattedStatus === 'complete') {
    return {
      value: returnLogId,
      text: 'Edit return'
    }
  }

  // Else you have a due or received return so can only submit the first return submission
  return {
    value: returnLogId,
    text: 'Submit return'
  }
}

function _backLink(returnId, licenceId, latest) {
  if (latest) {
    return {
      href: `/system/licences/${licenceId}/returns`,
      text: 'Go back to summary'
    }
  }

  return {
    href: `/system/return-logs?id=${returnId}`,
    text: 'Go back to the latest version'
  }
}

function _displayTable(selectedReturnSubmission) {
  // We are dealing with a due or received return log so there are no submissions.
  if (!selectedReturnSubmission) {
    return false
  }

  return !selectedReturnSubmission.nilReturn
}

function _downloadCSVLink(selectedReturnSubmission, returnLogId) {
  if (!selectedReturnSubmission || selectedReturnSubmission.nilReturn) {
    return null
  }

  const { version } = selectedReturnSubmission

  return `/system/return-logs/download?id=${returnLogId}&version=${version}`
}

function _latest(versions, selectedReturnSubmission) {
  // We are dealing with a due or received return log so there are no submissions. We treat this as 'latest' to avoid
  // displaying the warning message
  if (!selectedReturnSubmission) {
    return true
  }

  return versions[0].id === selectedReturnSubmission.id
}

function _selectedReturnSubmission(returnSubmissions) {
  if (!returnSubmissions) {
    return null
  }

  return returnSubmissions[0]
}

function _startReading(selectedReturnSubmission) {
  if (!selectedReturnSubmission) {
    return null
  }

  return selectedReturnSubmission.$meter()?.startReading || null
}

function _summaryTableData(selectedReturnSubmission, returnsFrequency) {
  if (!selectedReturnSubmission || selectedReturnSubmission.nilReturn) {
    return null
  }

  const { id: returnSubmissionId, returnSubmissionLines } = selectedReturnSubmission
  const method = selectedReturnSubmission.$method()
  const units = selectedReturnSubmission.$units()

  return {
    headers: generateSummaryTableHeaders(method, returnsFrequency, units),
    rows: generateSummaryTableRows(method, returnsFrequency, returnSubmissionLines, returnSubmissionId)
  }
}

function _tableTitle(summaryTableData, returnsFrequency, method) {
  if (!summaryTableData) {
    return null
  }

  const frequency = returnRequirementFrequencies[returnsFrequency]
  const postfix = method === 'abstractionVolumes' ? 'abstraction volumes' : 'meter readings'

  return `Summary of ${frequency} ${postfix}`
}

function _total(selectedReturnSubmission) {
  if (!selectedReturnSubmission || selectedReturnSubmission.nilReturn) {
    return formatNumber(0)
  }

  const total = selectedReturnSubmission.returnSubmissionLines.reduce((acc, line) => {
    const quantity = line.quantity ?? 0

    return acc + quantity
  }, 0)

  return formatNumber(total)
}

function _versions(selectedReturnSubmission, versions, returnLogId) {
  // We are dealing with a due or received return log so there are no submissions, which means no versions to display
  if (!selectedReturnSubmission) {
    return null
  }

  return versions.map((version) => {
    const { createdAt, id, notes, userId: user, version: number } = version

    return {
      createdAt: `${formatLongDate(createdAt)}`,
      link: `/system/return-logs?id=${returnLogId}&version=${number}`,
      notes,
      selected: id === selectedReturnSubmission.id,
      version: number,
      user
    }
  })
}

function _warning(status, latest) {
  if (status === 'void') {
    return 'This return is void and has been replaced. Do not use this data.'
  }

  if (!latest) {
    return 'You are viewing a previous version. This is not the latest submission data.'
  }

  return null
}

module.exports = {
  go
}

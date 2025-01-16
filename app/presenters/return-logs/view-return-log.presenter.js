'use strict'

/**
 * Formats return log data ready for presenting in the view return log page
 * @module ViewReturnLogPresenter
 */

const { formatAbstractionPeriod, formatLongDate, formatNumber } = require('../base.presenter.js')
const {
  formatMeterDetails,
  formatStatus,
  generateSummaryTableHeaders,
  generateSummaryTableRows
} = require('./base-return-logs.presenter.js')
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
    periodEndDay,
    periodEndMonth,
    periodStartDay,
    periodStartMonth,
    purposes,
    receivedDate,
    returnReference,
    returnsFrequency,
    returnSubmissions,
    siteDescription,
    status,
    startDate,
    twoPartTariff,
    versions
  } = returnLog

  const selectedReturnSubmission = _selectedReturnSubmission(returnSubmissions)
  const latest = _latest(versions, selectedReturnSubmission)

  const method = selectedReturnSubmission?.$method()
  const units = selectedReturnSubmission?.$units()

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    actionButton: _actionButton(latest, auth, returnLog.id, status),
    backLink: _backLink(returnLog.id, licence.id, latest),
    displayReadings: method !== 'abstractionVolumes',
    displayTable: _displayTable(selectedReturnSubmission),
    displayTotal: !!selectedReturnSubmission,
    displayUnits: units !== unitNames.CUBIC_METRES,
    latest,
    licenceRef: licence.licenceRef,
    meterDetails: formatMeterDetails(selectedReturnSubmission?.$meter()),
    method,
    nilReturn: selectedReturnSubmission ? selectedReturnSubmission.nilReturn : false,
    pageTitle: 'Abstraction return',
    purpose: _purpose(purposes),
    receivedDate: receivedDate ? formatLongDate(receivedDate) : null,
    returnReference,
    returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    siteDescription,
    startReading: _startReading(selectedReturnSubmission),
    status: formatStatus(returnLog),
    summaryTableData: _summaryTableData(selectedReturnSubmission, returnsFrequency),
    tableTitle: _tableTitle(returnsFrequency, method),
    tariff: twoPartTariff ? 'Two-part' : 'Standard',
    total: _total(selectedReturnSubmission),
    versions: _versions(selectedReturnSubmission, versions, id)
  }
}

function _actionButton(latest, auth, returnLogId, status) {
  // You cannot edit a previous version
  if (!latest) {
    return null
  }

  // You cannot edit a void return
  if (status === 'void') {
    return null
  }

  // You cannot submit or edit if you do not have permission to
  if (!auth.credentials.scope.includes('returns')) {
    return null
  }

  // You can only edit a completed return
  if (status === 'completed') {
    return {
      href: `/return/internal?returnId=${returnLogId}`,
      text: 'Edit return'
    }
  }

  // Else you have a due or received return so can only submit the first return submission
  return {
    href: `/system/return-logs/setup?returnLogId=${returnLogId}`,
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

function _latest(versions, selectedReturnSubmission) {
  // We are dealing with a due or received return log so there are no submissions. We treat this as 'latest' to avoid
  // displaying the warning message
  if (!selectedReturnSubmission) {
    return true
  }

  return versions[0].id === selectedReturnSubmission.id
}

function _purpose(purposes) {
  const [firstPurpose] = purposes

  return firstPurpose.alias ? firstPurpose.alias : firstPurpose.tertiary.description
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

  return selectedReturnSubmission.$meter()?.startReading
}

function _summaryTableData(selectedReturnSubmission, returnsFrequency) {
  if (!selectedReturnSubmission) {
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

function _tableTitle(returnsFrequency, method) {
  const frequency = returnRequirementFrequencies[returnsFrequency]
  const postfix = method === 'abstractionVolumes' ? 'abstraction volumes' : 'meter readings'

  return `Summary of ${frequency} ${postfix}`
}

function _total(selectedReturnSubmission) {
  if (!selectedReturnSubmission || selectedReturnSubmission.nilReturn) {
    return 0
  }

  const total = selectedReturnSubmission.returnSubmissionLines.reduce((total, line) => {
    const quantity = line.quantity ?? 0

    return total + quantity
  }, 0)

  return formatNumber(total)
}

function _versions(selectedReturnSubmission, versions, returnLogId) {
  // We are dealing with a due or received return log so there are no submissions, which means no versions to display
  if (!selectedReturnSubmission) {
    return null
  }

  return versions.map((version) => {
    const { createdAt, id, userId: user, version: number } = version

    return {
      createdAt: `${formatLongDate(createdAt)}`,
      link: `/system/return-logs?id=${returnLogId}&version=${number}`,
      selected: id === selectedReturnSubmission.id,
      version: number,
      user
    }
  })
}

module.exports = {
  go
}

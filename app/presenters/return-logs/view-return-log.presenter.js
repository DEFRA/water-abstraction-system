'use strict'

/**
 * Formats return log data ready for presenting in the view return log page
 * @module ViewReturnLogPresenter
 */

const { formatAbstractionPeriod, formatLongDate, formatNumber } = require('../base.presenter.js')
const {
  formatMeterDetails,
  formatStartReading,
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
    returnReference,
    returnsFrequency,
    returnSubmissions,
    siteDescription,
    status,
    startDate,
    twoPartTariff,
    versions
  } = returnLog

  const selectedReturnSubmission = returnSubmissions[0]
  const latest = _latest(versions, selectedReturnSubmission)
  const editReturn = _editReturn(latest, auth, status)

  const method = selectedReturnSubmission.$method()
  const units = selectedReturnSubmission.$units()
  const summaryTableHeaders = generateSummaryTableHeaders(method, returnsFrequency, units)
  const summaryTableRows = generateSummaryTableRows(
    method,
    returnsFrequency,
    selectedReturnSubmission.returnSubmissionLines,
    selectedReturnSubmission.id
  )

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    backLink: _backLink(returnLog.id, licence.id, latest),
    displayReadings: method !== 'abstractionVolumes',
    displayUnits: units !== unitNames.CUBIC_METRES,
    editReturn,
    editReturnLink: editReturn ? `/return/internal?returnId=${returnLog.id}` : null,
    latest,
    licenceRef: licence.licenceRef,
    meterDetails: formatMeterDetails(selectedReturnSubmission.$meter()),
    method,
    nilReturn: selectedReturnSubmission.nilReturn,
    purpose: _purpose(purposes),
    returnReference,
    returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    siteDescription,
    startReading: selectedReturnSubmission.$meter()?.startReading,
    status,
    summaryTableHeaders,
    summaryTableRows,
    tableTitle: _tableTitle(returnsFrequency, method),
    tariff: twoPartTariff ? 'Two-part' : 'Standard',
    total: _total(selectedReturnSubmission),
    versions: _versions(selectedReturnSubmission.id, versions, id)
  }
}

function _backLink(returnId, licenceId, latest) {
  if (latest) {
    return {
      href: `/system/licences/${licenceId}/summary`,
      text: 'Go back to summary'
    }
  }

  return {
    href: `/system/return-logs?id=${returnId}`,
    text: 'Go back to the latest version'
  }
}

function _latest(versions, selectedReturnSubmission) {
  return versions[0].id === selectedReturnSubmission.id
}

function _editReturn(latest, auth, status) {
  // You cannot edit a previous version
  if (!latest) {
    return false
  }

  // You cannot edit if you do not have permission to
  if (!auth.credentials.scope.includes('returns')) {
    return false
  }

  // You can only edit (add a new submission) to a completed or received return
  return ['completed', 'received'].includes(status)
}

function _purpose(purposes) {
  const [firstPurpose] = purposes

  return firstPurpose.alias ? firstPurpose.alias : firstPurpose.tertiary.description
}

function _tableTitle(returnsFrequency, method) {
  const frequency = returnRequirementFrequencies[returnsFrequency]
  const postfix = method === 'abstractionVolumes' ? 'abstraction volumes' : 'meter readings'

  return `Summary of ${frequency} ${postfix}`
}

function _total(selectedReturnSubmission) {
  if (selectedReturnSubmission.nilReturn) {
    return 0
  }

  const total = selectedReturnSubmission.returnSubmissionLines.reduce((total, line) => {
    const quantity = line.quantity ?? 0

    return total + quantity
  }, 0)

  return formatNumber(total)
}

function _versions(selectedReturnSubmissionId, versions, returnLogId) {
  return versions.map((version) => {
    const { createdAt, id, userId: user, version: number } = version

    return {
      createdAt: `${formatLongDate(createdAt)} v${number}`,
      link: `/system/return-logs?id=${returnLogId}&version=${number}`,
      selected: id === selectedReturnSubmissionId,
      user
    }
  })
}

module.exports = {
  go
}

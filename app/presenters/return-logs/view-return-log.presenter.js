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
    twoPartTariff
  } = returnLog

  const currentReturnSubmission = _currentReturnSubmission(returnSubmissions)
  const editReturn = _editReturn(auth, status)

  const method = currentReturnSubmission.$method()
  const units = currentReturnSubmission.$units()
  const summaryTableHeaders = generateSummaryTableHeaders(method, returnsFrequency, units)
  const summaryTableRows = generateSummaryTableRows(
    currentReturnSubmission.id,
    method,
    returnsFrequency,
    currentReturnSubmission.returnSubmissionLines
  )

  return {
    abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
    displayReadings: method !== 'abstractionVolumes',
    displayUnits: units !== unitNames.CUBIC_METRES,
    editReturn,
    editReturnLink: editReturn ? `/return-logs/setup/${returnLog.id}` : null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    meterDetails: formatMeterDetails(currentReturnSubmission.$meter()),
    method,
    nilReturn: currentReturnSubmission.nilReturn,
    purpose: _purpose(purposes),
    returnReference,
    returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    siteDescription,
    startReading: formatStartReading(currentReturnSubmission.$meter()),
    status,
    summaryTableHeaders,
    summaryTableRows,
    tableTitle: _tableTitle(returnsFrequency, method),
    tariff: twoPartTariff ? 'Two-part' : 'Standard',
    total: _total(currentReturnSubmission),
    versions: _versions(currentReturnSubmission)
  }
}

function _currentReturnSubmission(returnSubmissions) {
  if (returnSubmissions.length === 0) {
    return null
  }

  return returnSubmissions[0]
}

function _editReturn(auth, status) {
  if (!auth.credentials.scope.includes('returns')) {
    return false
  }

  if (status === 'void' || status === 'due') {
    return false
  }

  return true
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

function _total(currentReturnSubmission) {
  if (currentReturnSubmission.nilReturn) {
    return 0
  }

  const total = currentReturnSubmission.returnSubmissionLines.reduce((total, line) => {
    const quantity = line.quantity ?? 0

    return total + quantity
  }, 0)

  return formatNumber(total)
}

function _versions(currentReturnSubmission) {
  const { createdAt, userId } = currentReturnSubmission

  return [
    {
      createdAt: formatLongDate(createdAt),
      current: true,
      user: userId
    }
  ]
}

module.exports = {
  go
}

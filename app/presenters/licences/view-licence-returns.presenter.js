'use strict'

/**
 * Formats data for the `/licences/{id}/returns` view licence returns page
 * @module ViewLicenceReturnsPresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const { formatLongDate, formatPurposes, formatReturnLogStatus } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/returns` view licence returns page
 *
 * @param {module:ReturnLogModel[]} returnLogs - The results from `FetchLicenceReturnsService` to be formatted
 * @param {boolean} hasRequirements - True if the licence has return requirements else false
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} The data formatted for the view template
 */
function go(returnLogs, hasRequirements, auth) {
  const canManageReturns = auth.credentials.scope.includes('returns')
  const returns = _returns(returnLogs, canManageReturns)

  const hasReturns = returns.length > 0

  return {
    returns,
    noReturnsMessage: _noReturnsMessage(hasReturns, hasRequirements)
  }
}

function _link(status, returnId, returnLogId, canManageReturns) {
  if (FeatureFlagsConfig.enableSystemReturnsView) {
    return `/system/return-logs/${returnId}`
  }

  if (['completed', 'void'].includes(status)) {
    return `/returns/return?id=${returnLogId}`
  }

  if (canManageReturns) {
    return `/return/internal?returnId=${returnLogId}`
  }

  return null
}

function _noReturnsMessage(hasReturns, hasRequirements) {
  if (!hasReturns && !hasRequirements) {
    return 'No requirements for returns have been set up for this licence.'
  }

  if (hasRequirements && !hasReturns) {
    return 'No returns for this licence.'
  }

  return null
}

function _returns(returns, canManageReturns) {
  return returns.map((returnLog) => {
    const { endDate, dueDate, id: returnLogId, metadata, returnId, returnReference, startDate, status } = returnLog

    return {
      dates: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
      description: metadata.description === 'null' ? '' : metadata.description,
      dueDate: dueDate ? formatLongDate(new Date(dueDate)) : '',
      link: _link(status, returnId, returnLogId, canManageReturns),
      purpose: formatPurposes(metadata.purposes),
      reference: returnReference,
      status: formatReturnLogStatus(returnLog)
    }
  })
}

module.exports = {
  go
}

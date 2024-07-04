'use strict'

/**
 * Formats data for the `/licences/{id}/returns` view licence returns page
 * @module ViewLicenceReturnsPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/returns` view licence returns page
 *
 * @param {module:ReturnLogModel[]} returnLogs - The results from `FetchLicenceReturnsService` to be formatted
 * @param {boolean} hasRequirements - True if the licence has return requirements else false
 *
 * @returns {Object} The data formatted for the view template
 */
function go (returnLogs, hasRequirements) {
  const returns = _returns(returnLogs)

  const hasReturns = returns.length > 0

  return {
    returns,
    noReturnsMessage: _noReturnsMessage(hasReturns, hasRequirements)
  }
}

function _link (status, returnLogId) {
  if (status === 'completed') {
    return `/returns/return?id=${returnLogId}`
  }

  return `/return/internal?returnId=${returnLogId}`
}

function _noReturnsMessage (hasReturns, hasRequirements) {
  if (!hasReturns && !hasRequirements) {
    return 'No requirements for returns have been set up for this licence.'
  }

  if (hasRequirements && !hasReturns) {
    return 'No returns for this licence.'
  }

  return null
}

function _purpose (purpose) {
  const [firstPurpose] = purpose

  return firstPurpose.alias ? firstPurpose.alias : firstPurpose.tertiary.description
}

function _returns (returns) {
  return returns.map((returnLog) => {
    const { endDate, dueDate, id: returnLogId, metadata, returnReference, startDate, status } = returnLog

    return {
      dates: `${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
      description: metadata.description,
      dueDate: formatLongDate(new Date(dueDate)),
      link: _link(status, returnLogId),
      purpose: _purpose(metadata.purposes),
      reference: returnReference,
      returnLogId,
      status: _status(returnLog)
    }
  })
}

function _status (returnLog) {
  const { status, dueDate } = returnLog

  // If the return is completed we are required to display it as 'complete'. This also takes priority over the other
  // statues
  if (status === 'completed') {
    return 'complete'
  }

  // Work out if the return is overdue (status is still 'due' and it is past the due date)
  const today = new Date()

  if (status === 'due' && dueDate < today) {
    return 'overdue'
  }

  // For all other cases we can just return the status and the return-status-tag macro will know how to display it
  return status
}

module.exports = {
  go
}

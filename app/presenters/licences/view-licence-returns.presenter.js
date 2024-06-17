'use strict'

/**
 * Formats common data for the `/licences/{id}/*` view licence pages
 * @module ViewLicenceReturnsPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Formats common data for the `/licences/{id}/*` view licence pages
 *
 * @param {module:ReturnLogModel[]} returnsData - The session for the return requirement journey
 * @param {boolean} hasRequirements - If the licence has return versions then it has requirements
 *
 * @returns {Object} The data formatted for the view template
 */
function go (returnsData, hasRequirements) {
  const returns = _formatReturnToTableRow(returnsData)

  const hasReturns = returns.length > 0

  return {
    activeTab: 'returns',
    returns,
    noReturnsMessage: _noReturnsMessage(hasReturns, hasRequirements)
  }
}

function _formatPurpose (purpose) {
  const [firstPurpose] = purpose

  return firstPurpose.alias ? firstPurpose.alias : firstPurpose.tertiary.description
}

function _formatReturnToTableRow (returns) {
  return returns.map((returnLog) => {
    return {
      dates: `${formatLongDate(new Date(returnLog.startDate))} to ${formatLongDate(new Date(returnLog.endDate))}`,
      description: returnLog.metadata.description,
      dueDate: formatLongDate(new Date(returnLog.dueDate)),
      id: returnLog.id,
      purpose: _formatPurpose(returnLog.metadata.purposes),
      reference: returnLog.returnReference,
      status: _formatStatus(returnLog)
    }
  })
}

function _formatStatus (returnLog) {
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

function _noReturnsMessage (hasReturns, hasRequirements) {
  if (!hasReturns && !hasRequirements) {
    return 'No requirements for returns have been set up for this licence.'
  }

  if (hasRequirements && !hasReturns) {
    return 'No returns for this licence.'
  }

  return null
}

module.exports = {
  go
}

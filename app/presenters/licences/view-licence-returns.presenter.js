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
  return returns.map((r) => {
    return {
      dates: `${formatLongDate(new Date(r.startDate))} to ${formatLongDate(new Date(r.endDate))}`,
      description: r.metadata.description,
      dueDate: formatLongDate(new Date(r.dueDate)),
      id: r.id,
      purpose: _formatPurpose(r.metadata.purposes),
      reference: r.returnReference,
      status: _formatStatus(r.status)
    }
  })
}

function _formatStatus (status) {
  if (status === 'completed') {
    return 'COMPLETE'
  }

  if (status === 'due') {
    return 'OVERDUE'
  }

  return 'NO STATUS'
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

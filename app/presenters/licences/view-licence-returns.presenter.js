'use strict'

/**
 * Formats common data for the `/licences/{id}/*` view licence pages
 * @module ViewLicenceReturnsPresenter
 */

const { formatLongDate } = require('../base.presenter')

/**
 * Formats common data for the `/licences/{id}/*` view licence pages
 *
 * @returns {Object} The data formatted for the view template
 */
function go (returnsData) {
  const returns = _formatReturnToTableRow(returnsData.returns)

  return {
    activeTab: 'returns',
    returns
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
  if (status === 'completed') return 'COMPLETE'
  if (status === 'due') return 'OVERDUE'
  return 'NO STATUS'
}

module.exports = {
  go
}

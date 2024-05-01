'use strict'

/**
 * Formats data for common licence data `/licences/{id}` page's
 * @module ViewLicenceReturnsPresenter
 */

const { formatLongDate } = require('../base.presenter')

/**
 * Formats data for common licence data `/licences/{id}` page's
 *
 * @returns {Object} The data formatted for the view template
 */
function go () {
  const fakeReturn = [{
    reference: 'Mock reference',
    purpose: 'mock purpose',
    dueDate: '2023-04-28',
    status: 'complete'
  }]
  return {
    activeTab: 'returns',
    returns: _formatToTableRow(fakeReturn)
  }
}

function _formatToTableRow (returns) {
  return returns.map(r => {
    return {
      reference: r.reference,
      purpose: r.purpose,
      dueDate: formatLongDate(new Date(r.dueDate)),
      status: r.status.toLowerCase()
    }
  })
}

module.exports = {
  go
}

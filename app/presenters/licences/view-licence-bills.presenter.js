'use strict'

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 * @module ViewLicenceBillsPresenter
 */

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (billsData) {
  return {
    activeTab: 'bills'
  }
}

module.exports = {
  go
}

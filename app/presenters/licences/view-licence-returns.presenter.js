'use strict'

/**
 * Formats data for common licence data `/licences/{id}` page's
 * @module ViewLicenceReturnsPresenter
 */

/**
 * Formats data for common licence data `/licences/{id}` page's
 *
 * @returns {Object} The data formatted for the view template
 */
function go () {
  return {
    activeTab: 'returns',
    message: 'hello returns'
  }
}

module.exports = {
  go
}

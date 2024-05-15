'use strict'

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 * @module CommunicationsPresenter
 */

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (communications) {
  return {
    communications: _communications(communications)
  }
}

function _communications (communications) {
  return communications.map((communication) => {
    return {
      ...communication
    }
  })
}

module.exports = {
  go
}

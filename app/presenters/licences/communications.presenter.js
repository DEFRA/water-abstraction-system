'use strict'

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 * @module CommunicationsPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

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
      sender: communication.event.issuer,
      sent: formatLongDate(communication.event.createdAt)
    }
  })
}

module.exports = {
  go
}

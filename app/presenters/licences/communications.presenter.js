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

function _type (communication) {
//   {#          {% if message.isPdf %}
//     {{ message.event.metadata.name }}
//     <span class="govuk-visually-hidden"> sent {{ message.event.created | date }} via {{ message.messageType }}</span>
//   {% else %}
//     <a href="/licences/{{ documentId }}/communications/{{ message.id }}">
//       {{ message.event.metadata.options.sendingAlertType | sentenceCase + ' - ' if message.event.metadata.name == 'Water abstraction alert' else '' }}
//       {{ message.event.metadata.name }}
//       <span class="govuk-visually-hidden"> sent {{ message.event.created | date }} via {{ message.messageType }}</span>
//     </a>
//   {% endif %}#}
}

function _communications (communications) {
  return communications.map((communication) => {
    return {
      sender: communication.event.issuer,
      sent: formatLongDate(communication.event.createdAt),
      method: communication.messageType.toLowerCase()
    }
  })
}

module.exports = {
  go
}

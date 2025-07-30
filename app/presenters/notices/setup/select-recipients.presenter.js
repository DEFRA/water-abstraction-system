'use strict'

/**
 * Formats data for the '/notices/setup/{sessionId}/select-recipients' page
 * @module SelectRecipientsPresenter
 */

const ContactPresenter = require('./contact.presenter.js')

/**
 * Formats data for the '/notices/setup/{sessionId}/select-recipients' page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {object[]} recipients
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, recipients) {
  const { id: sessionId } = session

  return {
    pageTitle: 'Select Recipients',
    backLink: `/system/notices/setup/${sessionId}/check`,
    recipients: _recipients(recipients)
  }
}

function _recipients(recipients) {
  return recipients.map((recipient) => {
    const contact = ContactPresenter.go(recipient)

    return {
      contact,
      contact_hash_id: recipient.contact_hash_id,
      checked: true
    }
  })
}

module.exports = {
  go
}

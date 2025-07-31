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
  const { id: sessionId, selectedRecipients } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/check`,
    pageTitle: 'Select Recipients',
    recipients: _recipients(recipients, selectedRecipients)
  }
}

function _recipients(recipients, selectedRecipients = []) {
  return recipients.map((recipient) => {
    const contact = ContactPresenter.go(recipient)

    return {
      checked: selectedRecipients.includes(recipient.contact_hash_id),
      contact,
      contact_hash_id: recipient.contact_hash_id
    }
  })
}

module.exports = {
  go
}

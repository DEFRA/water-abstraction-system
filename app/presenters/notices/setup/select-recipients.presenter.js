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
    contactTypeLink: `/system/notices/setup/${sessionId}/contact-type`,
    pageTitle: 'Select Recipients',
    recipients: _recipients(recipients, selectedRecipients)
  }
}

/**
 * Determines if a recipient should be marked as checked.
 *
 * The 'selectedRecipients' are initialised on the check page, it should always exist.
 * @private
 */
function _checked(selectedRecipients, recipient) {
  return selectedRecipients.includes(recipient.contact_hash_id)
}

function _recipients(recipients, selectedRecipients) {
  return recipients.map((recipient) => {
    const contact = ContactPresenter.go(recipient)

    return {
      checked: _checked(selectedRecipients, recipient),
      contact,
      contact_hash_id: recipient.contact_hash_id
    }
  })
}

module.exports = {
  go
}

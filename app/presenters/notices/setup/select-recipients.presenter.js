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
    recipients: _recipients(recipients, selectedRecipients, session)
  }
}

/**
 * Determines if a recipient should be marked as checked.
 *
 * If no `selectedRecipients` are provided (i.e., it's falsy), then all contacts should be marked as checked (`true`).
 * Otherwise, only recipient whose `contact_hash_id` appears in `selectedRecipients` should be marked as checked.
 *
 * @private
 */
function _checked(selectedRecipients, recipient, addressVisited) {
  if (selectedRecipients === undefined) {
    return true
  }

  if (addressVisited) {
    return true
  }

  return selectedRecipients.includes(recipient.contact_hash_id)
}

function _recipients(recipients, selectedRecipients, session) {
  return recipients.map((recipient) => {
    const contact = ContactPresenter.go(recipient)

    return {
      checked: _checked(selectedRecipients, recipient, session.addressVisited),
      contact,
      contact_hash_id: recipient.contact_hash_id
    }
  })
}

module.exports = {
  go
}

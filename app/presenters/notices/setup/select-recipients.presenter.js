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
 * @param {string[]} selectedRecipients - an array of 'contact_hash_id' selected by the user
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, recipients, selectedRecipients) {
  const { id: sessionId, referenceCode } = session

  return {
    backLink: {
      href: `/system/notices/setup/${sessionId}/check`,
      text: 'Back'
    },
    contactTypeLink: `/system/notices/setup/${sessionId}/contact-type`,
    pageTitle: 'Select Recipients',
    pageTitleCaption: `Notice ${referenceCode}`,
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

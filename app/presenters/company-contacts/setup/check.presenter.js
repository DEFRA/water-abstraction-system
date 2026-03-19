'use strict'

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/check' page
 * @module CheckPresenter
 */

const { titleCase } = require('../../base.presenter.js')

/**
 * Formats data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {object} session - The session instance
 * @param {object[]} savedCompanyContacts - An array of company contacts stored in the database
 * @param {module:NotificationModel | undefined} sentNotification - A notification, or undefined if the email address
 * has not been used to send notifications
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, savedCompanyContacts, sentNotification) {
  const { company, email, name, abstractionAlerts, companyContact } = session

  const matchingContact = _matchingContact(email, name, savedCompanyContacts)

  return {
    abstractionAlerts: titleCase(abstractionAlerts),
    email,
    emailInUse: _emailInUse(sentNotification, companyContact),
    name,
    pageTitle: 'Check contact',
    pageTitleCaption: company.name,
    links: {
      abstractionAlerts: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
      cancel: `/system/company-contacts/setup/${session.id}/cancel`,
      email: `/system/company-contacts/setup/${session.id}/contact-email`,
      name: `/system/company-contacts/setup/${session.id}/contact-name`,
      restoreContact: matchingContact?.deletedAt ? `/system/company-contacts/setup/${session.id}/restore` : null
    },
    warning: _warning(matchingContact)
  }
}

/**
 * The presence of the 'companyContact' in session indicates that we are editing an existing contact.
 *
 * When editing, we do not want to allow the user to change the email address if the email address has been used to send a
 * notification.
 *
 * @private
 */
function _emailInUse(sentNotification, companyContact) {
  if (sentNotification && companyContact) {
    return 'Notifications have been sent to this contact, so the email address cannot be changed.'
  }

  return null
}

/*
 * Check if the contact already exists, if it does, then this is a match.
 *
 * However, when editing we want to check the matching contact is not the one we are currently editing.
 *
 * To do this, we perform two checks:
 * 1. Identity Check: Skip the record if it's the one we are currently editing.
 * 2. Similarity Check: Check if any OTHER record matches the unique criteria.
 */
function _matchingContact(email, name, savedCompanyContacts) {
  const lowerEmail = email?.toLowerCase()
  const lowerName = name.toLowerCase()

  return savedCompanyContacts.find((savedCompanyContact) => {
    return (
      savedCompanyContact.contact.email?.toLowerCase() === lowerEmail &&
      savedCompanyContact.contact.$name().toLowerCase() === lowerName
    )
  })
}

/*
 * Show the warning if the contact already exists.
 *
 * This variable is also used to show / hide the 'confirm' button, we do not allow a user to submit if the contact already
 * exists (when creating a company contact).
 */
function _warning(matchingContact) {
  if (matchingContact) {
    if (matchingContact.deletedAt) {
      return {
        text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
        iconFallbackText: 'Warning'
      }
    }

    return {
      text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
      iconFallbackText: 'Warning'
    }
  }

  return null
}

module.exports = {
  go
}

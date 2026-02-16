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
 * @param {object[]} savedCompanyContacts - An array of company contacts
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, savedCompanyContacts) {
  const { company, email, name, abstractionAlerts } = session

  return {
    abstractionAlerts: titleCase(abstractionAlerts),
    email,
    name,
    pageTitle: 'Check contact',
    pageTitleCaption: company.name,
    links: {
      abstractionAlerts: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
      cancel: `/system/company-contacts/setup/${session.id}/cancel`,
      email: `/system/company-contacts/setup/${session.id}/contact-email`,
      name: `/system/company-contacts/setup/${session.id}/contact-name`
    },
    warning: _warning(savedCompanyContacts, email, name)
  }
}

function _matchingContact(savedCompanyContacts, email, name) {
  const match = savedCompanyContacts.filter((companyContact) => {
    return (
      companyContact.contact.email.toLowerCase() === email.toLowerCase() &&
      companyContact.contact.department.toLowerCase() === name.toLowerCase()
    )
  })

  return match.length > 0
}

/*
 * Show the warning if the contact already exists
 *
 * This variable is used to show / hide the confirm button, we do not allow a user to submit if the contact already exists
 */
function _warning(savedCompanyContacts, email, name) {
  const matchingContact = _matchingContact(savedCompanyContacts, email, name)

  if (matchingContact) {
    return {
      text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
      iconFallbackText: 'Warning'
    }
  }

  return null
}

module.exports = {
  go
}

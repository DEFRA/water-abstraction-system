'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 * @module ContactPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {module:CompanyContactsModel[]} companyContacts - The company's contacts
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, companyContacts) {
  const { billingAccount } = session

  return {
    backLink: {
      href: `/system/billing-accounts/setup/${session.id}/fao`,
      text: 'Back'
    },
    contactSelected: session.contactSelected ?? null,
    items: _items(companyContacts.contacts, session.contactSelected),
    pageTitle: _pageTitle(companyContacts),
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _items(companyContacts, contactSelected) {
  const items = []

  for (const contact of companyContacts) {
    items.push({
      id: contact.id,
      value: contact.id,
      text: contact.$name(),
      checked: contact.id === contactSelected
    })
  }

  items.push(
    {
      divider: 'or'
    },
    {
      id: 'new',
      value: 'new',
      text: 'Add a new contact',
      checked: contactSelected === 'new'
    }
  )

  return items
}

function _pageTitle(companyContacts) {
  const name = companyContacts.company.name

  if (companyContacts.contacts.length === 0) {
    return `No company contacts found for "${name}"`
  }

  return `Set up a contact for ${name}`
}

module.exports = {
  go
}

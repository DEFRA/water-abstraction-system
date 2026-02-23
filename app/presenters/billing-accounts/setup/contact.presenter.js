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
    items: _items(companyContacts, session.contactSelected),
    pageTitle: _pageTitle(session, companyContacts),
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _items(companyContacts, contactSelected) {
  const items = []

  for (const companyContact of companyContacts) {
    items.push({
      id: companyContact.contact.id,
      value: companyContact.contact.id,
      text: companyContact.contact.$name(),
      checked: companyContact.contact.id === contactSelected
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

function _pageTitle(session, companyContacts) {
  const name = session.billingAccount.company.name

  if (companyContacts.length === 0) {
    return `No company contacts found for "${name}"`
  }

  return `Set up a contact for ${name}`
}

module.exports = {
  go
}

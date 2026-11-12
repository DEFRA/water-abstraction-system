/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 * @module ContactPresenter
 */

import { checkUrl } from 'water-abstraction-engine/lib/check-page.lib.js'

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {module:CompanyContactsModel[]} companyContacts - The company's contacts
 *
 * @returns {object} The data formatted for the view template
 */
export default function contactPresenter(session, companyContacts) {
  const { billingAccount } = session

  return {
    backLink: {
      href: checkUrl(session, `/system/billing-accounts/setup/${session.id}/fao`),
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
      checked: contact.id === contactSelected,
      id: contact.id,
      text: contact.$name(),
      value: contact.id
    })
  }

  items.push(
    {
      divider: 'or'
    },
    {
      checked: contactSelected === 'new',
      id: 'new',
      text: 'Add a new contact',
      value: 'new'
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

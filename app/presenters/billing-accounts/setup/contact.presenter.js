'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 * @module ContactPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {module:CompanyContactsModel[]} companyContacts - The companys contacts
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
    pageTitle: `Set up a contact for ${billingAccount.company.name}`,
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

module.exports = {
  go
}

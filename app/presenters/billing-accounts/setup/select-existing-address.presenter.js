'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 * @module SelectExistingAddressPresenter
 */

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 * @param {module:CompanyAddressModel} companyAddresses - The addresses linked to the company
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, companyAddresses) {
  const { billingAccount } = session
  const radioItems = _radioOptions(session.addressSelected, companyAddresses)

  return {
    backLink: {
      href: `/system/billing-accounts/setup/${session.id}/account`,
      text: 'Back'
    },
    items: radioItems,
    pageTitle: `Select an existing address for ${billingAccount.company.name}`,
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _radioOptions(addressSelected, companyAddresses) {
  const items = []

  for (const company of companyAddresses) {
    const { address } = company

    const addressParts = [
      address.address1,
      address.address2,
      address.address3,
      address.address4,
      address.address5,
      address.address6,
      address.postcode
    ]

    const text = addressParts
      .filter((part) => {
        return part && part.trim().length > 0
      })
      .map((part) => {
        return part.trim()
      })
      .join(', ')

    items.push({
      id: address.id,
      value: address.id,
      text,
      checked: addressSelected === address.id
    })
  }

  items.push(
    {
      divider: 'or'
    },
    {
      id: 'new',
      value: 'new',
      text: 'Setup a new address',
      checked: addressSelected === 'new'
    }
  )

  return items
}

module.exports = {
  go
}

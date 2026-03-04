'use strict'

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/existing-address` page
 * @module ExistingAddressPresenter
 */

const { checkUrl } = require('../../../lib/check-page.lib.js')

/**
 * Formats data for the `/billing-accounts/setup/{sessionId}/existing-address` page
 *
 * @param {module:SessionModel} session - The billing account setup session instance
 * @param {module:CompanyAddressModel} companyAddresses - The addresses linked to the company
 *
 * @returns {object} The data formatted for the view template
 */
function go(session, companyAddresses) {
  const { billingAccount } = session

  return {
    backLink: {
      href: checkUrl(session, _backLink(session)),
      text: 'Back'
    },
    items: _radioOptions(session.addressSelected, companyAddresses.addresses),
    pageTitle: _pageTitle(companyAddresses),
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _backLink(session) {
  if (session.accountType === 'individual') {
    return `/system/billing-accounts/setup/${session.id}/account-type`
  }

  if (session.accountType === 'company') {
    return `/system/billing-accounts/setup/${session.id}/select-company`
  }

  if (session.existingAccount) {
    return `/system/billing-accounts/setup/${session.id}/existing-account`
  }

  return `/system/billing-accounts/setup/${session.id}/account`
}

function _pageTitle(companyAddresses) {
  const { addresses, company } = companyAddresses

  if (addresses.length === 0) {
    return `No addresses found for ${company.name}`
  }

  return `Select an existing address for ${company.name}`
}

function _radioOptions(addressSelected, companyAddresses) {
  const items = []

  for (const address of companyAddresses) {
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

'use strict'

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 * @module ViewLicenceContactDetailsPresenter
 */

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 *
 * @param {module:LicenceModel} licence - The licence and related licenceDocumentHeader
 *
 * @returns {object} The data formatted for the view template
 */
function go (licence) {
  const { id: licenceId, licenceDocumentHeader, licenceRef } = licence

  return {
    licenceId,
    licenceRef,
    licenceContactDetails: _licenceContactDetails(licenceDocumentHeader),
    pageTitle: 'Licence contact details'
  }
}

function _licenceContactAddress (contact) {
  const contactAddressFields = [
    'addressLine1',
    'addressLine2',
    'addressLine3',
    'addressLine4',
    'town',
    'county',
    'postcode',
    'country'
  ]

  // NOTE:  Maps over the `contactAddressFields` array to create an array of values from the `contact` object. Each
  // `contactAddressField` corresponds to a property in the `contact` object, mapping and creating a contactAddress
  // array. The `filter(Boolean)` function then removes falsy values from the `contactAddress` array.
  const contactAddress = contactAddressFields.map((contactAddressField) => {
    return contact[contactAddressField]
  }).filter(Boolean)

  return contactAddress
}

function _licenceContactName (contact) {
  if (contact.type === 'Person') {
    const { salutation, forename, initials, name } = contact

    // NOTE: Prioritise the initials and use the contact forename if initials is null
    const initialsOrForename = initials || forename

    const nameComponents = [
      salutation,
      initialsOrForename,
      name
    ]

    const filteredNameComponents = nameComponents.filter((item) => {
      return item
    })

    return filteredNameComponents.join(' ')
  }

  return contact.name
}

function _licenceContactDetails (licenceDocumentHeader) {
  const licenceContactDetailsData = licenceDocumentHeader.metadata.contacts

  const roles = ['Licence holder', 'Returns to', 'Licence contact']

  const filteredContactDetails = licenceContactDetailsData.filter((licenceContactDetail) => {
    return roles.includes(licenceContactDetail.role)
  })

  return filteredContactDetails.map((contact) => {
    return {
      address: _licenceContactAddress(contact),
      role: contact.role,
      name: _licenceContactName(contact)
    }
  })
}

module.exports = {
  go
}

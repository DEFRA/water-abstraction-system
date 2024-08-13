'use strict'

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 * @module ViewLicenceContactPresenter
 */

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence) {
  const { id: licenceId, licenceDocumentHeader, licenceRef } = licence

  return {
    licenceId,
    licenceRef,
    licenceContacts: _licenceContacts(licenceDocumentHeader)
  }
}

function _licenceContactName (contact) {
  if (contact.type === 'Person') {
    return `${contact.forename || ''} ${contact.name}`.trim()
  }

  return contact.name
}

function _licenceContacts (licenceDocumentHeader) {
  const licenceContactData = licenceDocumentHeader.metadata.contacts

  console.log("data in licenceContactData", licenceContactData)
  const filteredContacts = licenceContactData.filter(data => {
    return data.role === 'Licence holder' || data.role === 'Returns to' || data.role === 'Licence contact'
  })

  return filteredContacts.map((contact) => {
    return {
      address: {
        addressLine1: contact.addressLine1,
        addressLine2: contact.addressLine2,
        addressLine3: contact.addressLine3,
        addressLine4: contact.addressLine4,
        town: contact.town,
        county: contact.county,
        postcode: contact.postcode,
        country: contact.country
      },
      role: contact.role,
      name: _licenceContactName(contact)
    }
  })
}

module.exports = {
  go
}

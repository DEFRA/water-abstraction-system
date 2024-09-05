'use strict'

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 * @module ViewLicenceContactPresenter
 */

/**
 * Formats data for the `/licences/{id}/licence-contact` view licence contact details link page
 *
 * @param {module:LicenceModel} licence - The licence and related licenceDocumentHeader
 *
 * @returns {Object} The data formatted for the view template
 */
function go (licence) {
  const { id: licenceId, licenceDocumentHeader, licenceRef } = licence

  return {
    licenceId,
    licenceRef,
    licenceContacts: _licenceContacts(licenceDocumentHeader),
    pageTitle: 'Licence contact details'
  }
}

function _licenceContactAddress (contact) {
  const contactAddress = []

  if (contact.addressLine1) {
    contactAddress.push(`${contact.addressLine1}`)
  }
  if (contact.addressLine2) {
    contactAddress.push(`${contact.addressLine2}`)
  }
  if (contact.addressLine3) {
    contactAddress.push(`${contact.addressLine3}`)
  }
  if (contact.addressLine4) {
    contactAddress.push(`${contact.addressLine4}`)
  }
  if (contact.town) {
    contactAddress.push(`${contact.town}`)
  }
  if (contact.county) {
    contactAddress.push(`${contact.county}`)
  }
  if (contact.postcode) {
    contactAddress.push(`${contact.postcode}`)
  }
  if (contact.country) {
    contactAddress.push(`${contact.country}`)
  }

  return {
    contactAddress
  }
}

function _licenceContactName (contact) {
  if (contact.type === 'Person') {
    const initials = _determineInitials(contact)

    const allNameParts = [
      contact.salutation,
      initials || contact.forename, // if we have initials use them else use firstName
      contact.name
    ]

    function _determineInitials (contact) {
      if (contact.initials) {
        return contact.initials
      }

      return null
    }

    const onlyPopulatedNameParts = allNameParts.filter((item) => {
      return item
    })

    return onlyPopulatedNameParts.join(' ')
  }

  return contact.name
}

function _licenceContacts (licenceDocumentHeader) {
  const licenceContactData = licenceDocumentHeader.metadata.contacts

  const filteredContacts = licenceContactData.filter((data) => {
    return data.role === 'Licence holder' || data.role === 'Returns to' || data.role === 'Licence contact'
  })

  return filteredContacts.map((contact) => {
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

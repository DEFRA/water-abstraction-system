'use strict'

/**
 * We have a couple of places where we need to show the company contact (in some places this is referred to as the customer contact)
 *
 * This function formats the company contact into an object used to show the company contacts.
 *
 * @param companyContact
 *
 * @returns {object} The company contact for the view
 */
function companyContact(companyContact) {
  return {
    communicationType: _communicationType(companyContact),
    name: companyContact.contact.$name(),
    email: companyContact.contact.email
  }
}

function _communicationType(companyContact) {
  if (companyContact.abstractionAlerts) {
    return 'Water abstraction alerts'
  }

  return companyContact.licenceRole.label
}

module.exports = {
  companyContact
}

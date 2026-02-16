'use strict'

/**
 * We have a couple of places where we need to show the company contact (in some places this is referred to as the customer contact)
 *
 * This function formats the company contact into an object used to show the company contacts.
 *
 * @param {module:CompanyContactModel} companyContact - a company contact
 *
 * @returns {object} The company contact for the view
 */
function formatCompanyContact(companyContact) {
  return {
    communicationType: _communicationType(companyContact),
    name: companyContact.contact.$name(),
    email: formatEmail(companyContact.contact.email)
  }
}

function _communicationType(companyContact) {
  if (companyContact.abstractionAlerts) {
    return 'Water abstraction alerts'
  }

  return companyContact.licenceRole.label
}

/**
 * All emails in WRLS should be lowercase.
 *
 * The email should be lowercase when saved in WRLS, however, the legacy data still contains mix case emails.
 *
 * @param {string | undefined} email - The email
 *
 * @returns {string|null} The email formatted for to lowercase or null
 */
function formatEmail(email) {
  if (email) {
    return email.toLowerCase()
  }

  return null
}

module.exports = {
  formatCompanyContact,
  formatEmail
}

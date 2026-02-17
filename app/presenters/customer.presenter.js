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
 * Converts an email to lowercase, if one has been set
 *
 * Technically, email addresses, specifically the bit before the '@' symbol, are case-sensitive. However, nearly all
 * email providers ignore case in email addresses, and treat `FOO@example.com` and `foo@example.com` as the same
 * address.
 *
 * Therefore, the accepted convention is to always store email addresses in lowercase to avoid any confusion.
 *
 * Surprise-surprise, the legacy service did not follow this convention!
 *
 * So, this function ensures any email addresses we collect are formatted as expected before being persisted.
 *
 * Also, until we can clean up the existing data, it ensures that any legacy email addresses are processed as lowercase.
 *
 * To avoid repeating the check of whether an email exists before passing it to this function, this function
 * deals with that. Calling code can just pass in, for example, `formatEmail(contact.email)` without worrying about an
 * error.
 *
 * @param {string} email - The email address to lowercase
 *
 * @returns {string|null} The email formatted to lowercase or null
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

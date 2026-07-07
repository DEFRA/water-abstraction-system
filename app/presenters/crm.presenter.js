import { roles } from '../lib/static-lookups.lib.js'

/**
 * Returns the display label for an abstraction alerts value
 *
 * @param {string} abstractionAlerts - The abstraction alerts value ('no', 'some', or 'yes')
 *
 * @returns {string} The label for the abstraction alerts value
 */
function abstractionAlertsLabel(abstractionAlerts) {
  const abstractionAlertsText = {
    no: 'No',
    some: 'Yes, for some licences',
    yes: 'Yes, for all licences'
  }

  return abstractionAlertsText[abstractionAlerts]
}

/**
 * Format the contact for the contacts table
 *
 * @param {object} contact - the contact from the crm data
 * @param {object} [billingQueryArgs] - the query args for billing accounts
 *
 * @returns {object} The formatted contact
 */
function formatContact(contact, billingQueryArgs) {
  return {
    link: _contactLink(contact, billingQueryArgs),
    name: contact.contactName,
    type: roles[contact.contactType].label
  }
}

/**
 * Compares a user's selected licences to 'live' ones for a company, and returns those that are live
 *
 * This is used in licence holder contact pages, where we need to show what licence a user has been assigned for a given
 * notice type.
 *
 * For example, licence holder contacts can be set to receive abstraction alerts. If the option has been set as 'yes'
 * or 'no', then the calling page simply needs to show the setting, either 'Yes, all licences' or 'No'.
 *
 * If the option has been set to 'some', then the calling page will show 'Yes, some licences' alongside a list of the
 * selected licence references.
 *
 * The complexity is that over time, licences can expire, lapse, or be revoked. When we show the selected licences, the
 * intention is to make it clear which ones they will receive a notification for. So, we need to exclude those that are
 * no longer 'live'.
 *
 * This function determines what the list of licence references should be, based on the settings of the user and the
 * current 'live' licences for the licence holder.
 *
 * @param {object[]} liveLicences - The licences for the company
 * @param {string[]} selectedLicences - The IDs of the selected licences the user should receive notifications for
 * @param {string} noticeSetting - The notice setting ('no', 'some', or 'yes')
 *
 * @returns {string[]} The licence references of 'live' licences the user has selected, or an empty array if not
 * applicable
 */
function selectedLiveLicences(liveLicences, selectedLicences, noticeSetting) {
  if (noticeSetting !== 'some' || !selectedLicences?.length) {
    return []
  }

  return liveLicences
    .filter((licence) => {
      return selectedLicences.includes(licence.id)
    })
    .map((licence) => {
      return licence.licenceRef
    })
}

function _contactLink(contact, billingQueryArgs) {
  const billingTypes = ['billing']
  const companyContactTypes = ['abstraction-alerts', 'additional-contact']
  const userTypes = ['basic-user', 'primary-user', 'returns-user']
  const queryString = new URLSearchParams(billingQueryArgs).toString()

  if (billingTypes.includes(contact.contactType)) {
    return `/system/billing-accounts/${contact.id}?${queryString}`
  }

  if (companyContactTypes.includes(contact.contactType)) {
    return `/system/company-contacts/${contact.id}/contact-details`
  }

  if (userTypes.includes(contact.contactType)) {
    return `/system/users/external/${contact.id}/details?back=search`
  }

  if (contact.addressId) {
    return `/system/companies/${contact.id}/address/${contact.addressId}/${contact.contactType}?${queryString}`
  }

  return `/system/companies/${contact.id}/${contact.contactType}`
}

export default {
  abstractionAlertsLabel,
  formatContact,
  selectedLiveLicences
}

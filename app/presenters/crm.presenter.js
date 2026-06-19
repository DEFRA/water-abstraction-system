'use strict'

const { roles } = require('../lib/static-lookups.lib.js')

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
 * Returns the licence references the user has selected to receive abstraction alerts for
 *
 * This is used to display the licence to the user.
 *
 * @param {object[]} licences - The licences for the company
 * @param {string[]} abstractionAlertLicences - The IDs of the licences selected to receive abstraction alerts
 * @param {string} abstractionAlerts - The abstraction alerts value ('no', 'some', or 'yes')
 *
 * @returns {string[]} The licence references the user has selected, or an empty array if not applicable
 */
function selectedLicences(licences, abstractionAlertLicences, abstractionAlerts) {
  if (abstractionAlerts !== 'some' || !abstractionAlertLicences?.length) {
    return []
  }

  return licences
    .filter((licence) => {
      return abstractionAlertLicences.includes(licence.id)
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

module.exports = {
  abstractionAlertsLabel,
  formatContact,
  selectedLicences
}

'use strict'

/**
 * Determine the remaining abstraction alerts
 *
 * @module DetermineRemainingAbstractionAlertsService
 */

const FetchCompanyContactService = require('../companies/fetch-company-contacts.service.js')

/**
 * Determine the remaining abstraction alerts
 *
 * @param {string} id - The company id for the company
 *
 * @returns {Promise<number>} The number of abstraction alerts remaining for the company contacts
 */
async function go(id) {
  const { companyContacts } = await FetchCompanyContactService.go(id)

  return countAbstractionAlerts(companyContacts)
}

function countAbstractionAlerts(companyContacts) {
  return companyContacts.filter((contact) => {
    return contact.abstractionAlerts === true
  }).length
}

module.exports = {
  go
}

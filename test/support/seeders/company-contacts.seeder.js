'use strict'

/**
 * @module CompantContactsSeeder
 */

const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

/**
 * Seed the company contacts
 *
 * To clean all the company contacts from the database, call the '.clean()' method
 *
 * @returns {object}  all the company contacts
 */
async function seed() {
  const company = await _company()
  const companyId = company.id

  const additionalContact = await _additionalContact(companyId)
  const abstractionAlerts = await _abstractionAlerts(companyId)

  return {
    abstractionAlerts,
    additionalContact,
    company,
    clean: async () => {
      await abstractionAlerts.clean()
      await additionalContact.clean()
    }
  }
}

async function _abstractionAlerts(companyId) {
  const licenceRole = LicenceRoleHelper.select('additionalContact')

  const contact = await ContactHelper.add({
    department: 'Granny Weatherwax'
  })

  const companyContact = await CompanyContactHelper.add({
    contactId: contact.id,
    licenceRoleId: licenceRole.id,
    abstractionAlerts: true,
    companyId
  })

  return {
    record: companyContact,
    clean: async () => {
      await companyContact.$query().delete()
      await contact.$query().delete()
    }
  }
}

async function _additionalContact(companyId) {
  const licenceRole = LicenceRoleHelper.select('additionalContact')

  const contact = await ContactHelper.add({
    department: 'Two flower'
  })

  const companyContact = await CompanyContactHelper.add({
    contactId: contact.id,
    licenceRoleId: licenceRole.id,
    abstractionAlerts: false,
    companyId
  })

  // Add additional contact - not related to the same company
  const additionalCompanyContact = await CompanyContactHelper.add({ contactId: contact.id })

  return {
    record: companyContact,
    clean: async () => {
      await companyContact.$query().delete()
      await contact.$query().delete()
      await additionalCompanyContact.$query().delete()
    }
  }
}

/**
 * The company will always be the licence holder
 *
 * @private
 */
async function _company() {
  return CompanyHelper.add({
    name: 'Ankh-Morpork'
  })
}

module.exports = {
  seed
}

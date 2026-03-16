'use strict'

/**
 * @module CRMSeeder
 */

const BillingAccountHelper = require('../helpers/billing-account.helper.js')
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceDocumentRoleHelper = require('../helpers/licence-document-role.helper.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const LicenceHelper = require('../helpers/licence.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')
const LicenceVersionHelper = require('../helpers/licence-version.helper.js')
const LicenceVersionHolderHelper = require('../helpers/licence-version-holder.helper.js')
const UserModel = require('../helpers/user.helper.js')

/**
 * Seed CRM data
 *
 * The crm data has multiple sources of contacts.
 *
 * We need to get contacts for a company from multiple sources. Theses can be grouped into two categories. External
 * users and those directly related to the company.
 *
 * Directly related to the company:
 * > Contacts directly related to the company are pretty straight forwards,
 * you can use the company id and return the record.
 *
 * These contacts are:
 * - abstraction-alerts - An additional contact marked to receive abstraction alerts
 * - licence-holder - The company that holds the licence
 * - returns-to - A company to handle the returns
 * - additional-contact - An additional contact for the licence
 * - billing - The billing accounts related to the company
 *
 * External users:
 * > External contacts are a little more complicated, they are not directly linked to the company. We need to get to the
 * licence, we do this from the licence version holder. Once we have the licence, we need to join the licence to the
 * licence document header using the licence ref. Then we need to return the external contacts from the licence entities.
 *
 * These contacts are:
 * - primary-user - An external user who a licence is registered to
 * - basic-user - A user with basic access to the system
 * - returns-user - A user with returns access to the system
 *
 * To clean all the contacts from the database, call the '.clean()' method
 *
 * @returns {object} - all the contacts
 */
async function seed() {
  // Setup company - The company will be the licence holder
  const company = await _company('Hogwarts')
  const companyId = company.record.id

  // Licence entity users are linked through the 'companyEntityId'
  const companyEntity = await _licenceCompanyEntity(company.record.name)
  const companyEntityId = companyEntity.record.id

  // Set up a licence linked to the company
  const licence = await _licence(company)
  const licenceDocumentHeader = await _licenceDocumentHeader(companyEntityId, licence.record.licenceRef)

  // Set up external users - linked to the company by the licence
  const basicUser = await _basicUser(companyEntityId, 'Minerva McGonagall')
  const primaryUser = await _primaryUser(companyEntityId, 'Albus Dumbledore')
  const returnsUser = await _returnsUser(companyEntityId, 'Severus Snape')

  // Set up additional contacts - linked to the company via the company contacts
  const abstractionAlerts = await _additionalContact(companyId, 'Gilderoy Lockhart', true)
  const additionalContact = await _additionalContact(companyId, 'Horace Slughorn')

  // Set up billing accounts
  const billing = await _billing(companyId)

  // Set up returns to - a contact linked through the licence document role to the company.
  const returnsTo = await _returnsTo(company.record)

  // Other contacts - To ensure the 'FetchCompanyCRMDataService' returns all licences related to a company, we need to
  // add another contact; this contact is linked to the company.
  const otherCompanyContact = await _additionalCompanyContact(additionalContact)
  const otherCompanyEntity = await _licenceCompanyEntity('The Leaky Cauldron')
  const otherLicence = await _licence(company)
  const otherLicenceDocumentHeader = await _licenceDocumentHeader(
    otherCompanyEntity.record.id,
    otherLicence.record.licenceRef
  )
  const additionalBasicUser = await _basicUser(otherCompanyEntity.record.id, 'Rubeus Hagrid')

  // Extra contact - Is set up is similar to the 'other' contact, but the company is different. The query should not
  // return the  as the company is different. This contact is not linked to the company.
  const extraCompany = await _company("Weasleys' Wizard Wheezes")
  const extraCompanyEntity = await _licenceCompanyEntity(extraCompany.record.name)
  const extraLicence = await _licence(extraCompany)
  const extraLicenceDocumentHeader = await _licenceDocumentHeader(
    extraCompanyEntity.record.id,
    extraLicence.record.licenceRef
  )
  const extraBasicUser = await _basicUser(extraCompanyEntity.record.id, 'Draco Malfoy')

  return {
    abstractionAlerts,
    additionalBasicUser,
    additionalContact,
    basicUser,
    billing,
    company,
    licence,
    primaryUser,
    returnsTo,
    returnsUser,
    clean: async () => {
      await abstractionAlerts.clean()
      await additionalBasicUser.clean()
      await additionalContact.clean()
      await basicUser.clean()
      await billing.clean()
      await company.clean()
      await companyEntity.clean()
      await extraBasicUser.clean()
      await extraCompany.clean()
      await extraCompanyEntity.clean()
      await extraLicence.clean()
      await extraLicenceDocumentHeader.clean()
      await licence.clean()
      await licenceDocumentHeader.clean()
      await otherCompanyContact.clean()
      await otherCompanyEntity.clean()
      await otherLicence.clean()
      await otherLicenceDocumentHeader.clean()
      await primaryUser.clean()
      await returnsTo.clean()
      await returnsUser.clean()
    }
  }
}

/**
 * An additional contact is added in the system logic.
 *
 * An abstraction alerts contact is an additional contact marked for abstraction alerts.
 *
 * @private
 */
async function _additionalContact(companyId, name, abstractionAlerts = false) {
  const licenceRole = LicenceRoleHelper.select('additionalContact')

  const contact = await ContactHelper.add({
    contactType: 'department',
    department: name
  })

  const companyContact = await CompanyContactHelper.add({
    contactId: contact.id,
    licenceRoleId: licenceRole.id,
    abstractionAlerts,
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

async function _additionalCompanyContact(additionalContact) {
  const additionalCompanyContact = await CompanyContactHelper.add({ contactId: additionalContact.record.contactId })

  return {
    record: additionalCompanyContact,
    clean: async () => {
      await additionalCompanyContact.$query().delete()
    }
  }
}

async function _basicUser(companyEntityId, name) {
  const licenceEntity = await LicenceEntityHelper.add({
    name,
    type: 'individual'
  })

  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    role: 'user',
    companyEntityId,
    licenceEntityId: licenceEntity.id
  })

  const user = await UserModel.add({
    licenceEntityId: licenceEntity.id,
    username: name
  })

  return {
    record: user,
    clean: async () => {
      await licenceEntity.$query().delete()
      await licenceEntityRole.$query().delete()
      await user.$query().delete()
    }
  }
}

async function _billing(companyId) {
  const billingAccount = await BillingAccountHelper.add({ companyId })

  return {
    record: billingAccount,
    clean: async () => {
      await billingAccount.$query().delete()
    }
  }
}

async function _company(name) {
  const company = await CompanyHelper.add({
    name
  })

  return {
    record: company,
    clean: async () => {
      await company.$query().delete()
    }
  }
}

async function _licence(company) {
  const licence = await LicenceHelper.add()

  const licenceVersion = await LicenceVersionHelper.add({
    licenceId: licence.id
  })

  const licenceVersionHolder = await LicenceVersionHolderHelper.add({
    licenceVersionId: licenceVersion.id,
    companyId: company.record.id
  })

  return {
    record: licence,
    clean: async () => {
      await licence.$query().delete()
      await licenceVersion.$query().delete()
      await licenceVersionHolder.$query().delete()
    }
  }
}

async function _licenceDocumentHeader(companyEntityId, licenceRef) {
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    companyEntityId,
    licenceRef
  })

  return {
    record: licenceDocumentHeader,
    clean: async () => {
      await licenceDocumentHeader.$query().delete()
    }
  }
}

async function _licenceCompanyEntity(name) {
  const licenceEntity = await LicenceEntityHelper.add({
    name,
    type: 'company'
  })

  return {
    record: licenceEntity,
    clean: async () => {
      await licenceEntity.$query().delete()
    }
  }
}

async function _primaryUser(companyEntityId, name) {
  const licenceEntity = await LicenceEntityHelper.add({
    name,
    type: 'individual'
  })

  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    role: 'primary_user',
    companyEntityId,
    licenceEntityId: licenceEntity.id
  })

  const user = await UserModel.add({
    licenceEntityId: licenceEntity.id,
    username: name
  })

  return {
    record: user,
    clean: async () => {
      await licenceEntity.$query().delete()
      await licenceEntityRole.$query().delete()
      await user.$query().delete()
    }
  }
}

async function _returnsTo(company) {
  const licenceRole = await LicenceRoleHelper.select('returnsTo')

  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    companyId: company.id,
    licenceRoleId: licenceRole.id,
    endDate: null
  })

  return {
    record: company,
    clean: async () => {
      await licenceDocumentRole.$query().delete()
    }
  }
}

async function _returnsUser(companyEntityId, name) {
  const licenceEntity = await LicenceEntityHelper.add({
    name,
    type: 'individual'
  })

  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    role: 'user_returns',
    companyEntityId,
    licenceEntityId: licenceEntity.id
  })

  await LicenceEntityRoleHelper.add({
    role: 'user',
    companyEntityId,
    licenceEntityId: licenceEntity.id
  })

  const user = await UserModel.add({
    licenceEntityId: licenceEntity.id,
    username: name
  })

  return {
    record: user,
    clean: async () => {
      await licenceEntity.$query().delete()
      await licenceEntityRole.$query().delete()
      await user.$query().delete()
    }
  }
}

module.exports = {
  seed
}

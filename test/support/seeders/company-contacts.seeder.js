'use strict'

/**
 * @module CompanyContactsSeeder
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
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Seed the company contacts
 *
 * To clean all the company contacts from the database, call the '.clean()' method
 *
 * @returns {object}  all the company contacts
 */
async function seed() {
  const company = await _company('Hogwarts')

  const licenceDocumentHeader = await _licenceDocumentHeader(company)

  const companyContacts = await _companyContacts(company.record, licenceDocumentHeader.record)

  // const additionalCompany = await _company('Wand & Willow')

  return {
    ...companyContacts,
    company,
    clean: async () => {
      await companyContacts.clean()
      await company.clean()
      await licenceDocumentHeader.clean()
    }
  }
}

async function _companyContacts(company, licenceDocumentHeader) {
  const abstractionAlerts = await _additionalContact(company.id, 'Gilderoy Lockhart', true)
  const additionalContact = await _additionalContact(company.id, 'Horace Slughorn')
  const basicUser = await _licenceEntity(company.id, 'user', 'Minerva McGonagall', licenceDocumentHeader)
  const billing = await _billing(company.id)
  const primaryUser = await _licenceEntity(company.id, 'primary_user', 'Albus Dumbledore', licenceDocumentHeader)
  const returnsTo = await _returnsTo(company)
  const returnsUser = await _licenceEntity(company.id, 'user_returns', 'Severus Snape', licenceDocumentHeader)

  return {
    abstractionAlerts,
    additionalContact,
    basicUser,
    billing,
    company,
    primaryUser,
    returnsTo,
    returnsUser,
    clean: async () => {
      await abstractionAlerts.clean()
      await additionalContact.clean()
      await basicUser.clean()
      await billing.clean()
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

async function _billing(companyId) {
  const billingAccount = await BillingAccountHelper.add({ companyId })

  return {
    record: billingAccount,
    clean: async () => {
      await billingAccount.$query().delete()
    }
  }
}

/**
 * The company will always be the licence holder
 *
 * @private
 */
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

async function _returnsTo(company) {
  const licenceRole = await LicenceRoleHelper.select('returnsTo')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    companyId: company.id,
    licenceRoleId: licenceRole.id,
    endDate: null,
    // The start date needs to be in the future
    startDate: tomorrow
  })

  return {
    record: company,
    clean: async () => {
      await licenceDocumentRole.$query().delete()
    }
  }
}

/**
 * The primary user, returns user and basic user have identical queries.
 *
 * The only thing to determine a difference is the role of the user.
 *
 * @private
 */
async function _licenceEntity(companyId, role, name, licenceDocumentHeader) {
  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    role,
    companyEntityId: licenceDocumentHeader.companyEntityId
  })

  const licenceEntity = await LicenceEntityHelper.add({
    id: licenceEntityRole.licenceEntityId,
    name
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

async function _licenceDocumentHeader(company) {
  const licence = await LicenceHelper.add()

  const licenceVersion = await LicenceVersionHelper.add({
    licenceId: licence.id
  })

  const licenceVersionHolder = await LicenceVersionHolderHelper.add({
    licenceVersionId: licenceVersion.id,
    companyId: company.record.id
  })

  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    companyEntityId: generateUUID(),
    licenceRef: licence.licenceRef
  })

  return {
    record: licenceDocumentHeader,
    clean: async () => {
      await licence.$query().delete()
      await licenceVersion.$query().delete()
      await licenceVersionHolder.$query().delete()
      await licenceDocumentHeader.$query().delete()
    }
  }
}

module.exports = {
  seed
}

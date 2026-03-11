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

/**
 * Seed the company contacts
 *
 * To clean all the company contacts from the database, call the '.clean()' method
 *
 * @returns {object}  all the company contacts
 */
async function seed() {
  const company = await _company('Hogwarts')

  const companyEntity = await _licenceCompanyEntity(company)

  const licenceDocumentHeader = await _licenceDocumentHeader(company, companyEntity)

  const companyId = company.record.id

  const companyEntityId = companyEntity.record.id

  const abstractionAlerts = await _additionalContact(companyId, 'Gilderoy Lockhart', true)
  const additionalContact = await _additionalContact(companyId, 'Horace Slughorn')
  const returnsTo = await _returnsTo(company.record)
  const billing = await _billing(companyId)
  const basicUser = await _licenceEntity(companyId, companyEntityId, 'user', 'Minerva McGonagall')
  const primaryUser = await _licenceEntity(companyId, companyEntityId, 'primary_user', 'Albus Dumbledore')
  const returnsUser = await _licenceEntity(companyId, companyEntityId, 'user_returns', 'Severus Snape')

  // const additionalCompany = await _company('Wand & Willow')

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
      await company.clean()
      await companyEntity.clean()
      await licenceDocumentHeader.clean()
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

async function _licenceDocumentHeader(company, companyEntity) {
  const licence = await LicenceHelper.add()

  const licenceVersion = await LicenceVersionHelper.add({
    licenceId: licence.id
  })

  const licenceVersionHolder = await LicenceVersionHolderHelper.add({
    licenceVersionId: licenceVersion.id,
    companyId: company.record.id
  })

  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    companyEntityId: companyEntity.record.id,
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

/**
 * The primary user, returns user and basic user have identical queries.
 *
 * The only thing to determine a difference is the role of the user.
 *
 * @private
 */
async function _licenceEntity(companyId, companyEntityId, role, name) {
  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    role,
    companyEntityId
  })

  const licenceEntity = await LicenceEntityHelper.add({
    id: licenceEntityRole.licenceEntityId,
    name,
    type: 'individual'
  })

  const user = await UserModel.add({
    licenceEntityId: licenceEntity.id,
    username: name
  })

  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    companyId,
    licenceRoleId: licenceEntityRole.id
  })

  return {
    record: user,
    clean: async () => {
      await licenceEntity.$query().delete()
      await licenceEntityRole.$query().delete()
      await user.$query().delete()
      await licenceDocumentRole.$query().delete()
    }
  }
}

async function _licenceCompanyEntity(company) {
  const licenceEntity = await LicenceEntityHelper.add({
    name: company.record.name,
    type: 'company'
  })

  return {
    record: licenceEntity,
    clean: async () => {
      await licenceEntity.$query().delete()
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

module.exports = {
  seed
}

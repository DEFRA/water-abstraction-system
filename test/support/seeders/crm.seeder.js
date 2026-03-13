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
 * To clean all the contacts from the database, call the '.clean()' method
 *
 * @returns {object} - all the contacts
 */
async function seed() {
  const company = await _company('Hogwarts')

  const companyEntity = await _licenceCompanyEntity(company.record.name)

  const companyId = company.record.id
  const companyEntityId = companyEntity.record.id

  const licence = await _licence(company)

  const licenceDocumentHeader = await _licenceDocumentHeader(companyEntityId, licence.record.licenceRef)

  const abstractionAlerts = await _additionalContact(companyId, 'Gilderoy Lockhart', true)
  const additionalContact = await _additionalContact(companyId, 'Horace Slughorn')
  const basicUser = await _basicUser(companyId, companyEntityId, 'Minerva McGonagall')
  const billing = await _billing(companyId)
  const primaryUser = await _primaryUser(companyId, companyEntityId, 'Albus Dumbledore')
  const returnsTo = await _returnsTo(company.record)
  const returnsUser = await _returnsUser(companyId, companyEntityId, 'Severus Snape')

  // Other contacts
  const otherCompanyContact = await _additionalCompanyContact(additionalContact)

  // Additional licence for the company with a contact
  const otherCompanyEntity = await _licenceCompanyEntity('The Leaky Cauldron')

  const otherCompanyEntityId = otherCompanyEntity.record.id

  const otherLicence = await _licence(company)

  const otherLicenceDocumentHeader = await _licenceDocumentHeader(otherCompanyEntityId, otherLicence.record.licenceRef)

  const additionalBasicUser = await _basicUser(companyId, otherCompanyEntityId, 'Rubeus Hagrid')

  // seedOtherCompany
  // this can use Leaky Cauldron company
  // - key is the three licences - two found to seed - 1 not
  // Create another company
  // Another licence / document header covers naldType contact
  // Created another basic user
  // 2 Another licence / document header covers naldType contact - reuse company entity ?
  // Licence entity - role / user
  // returns to user

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
      await otherCompanyContact.clean()
      await otherCompanyEntity.clean()
      await additionalContact.clean()
      await otherLicence.clean()
      await otherLicenceDocumentHeader.clean()
      await basicUser.clean()
      await billing.clean()
      await company.clean()
      await companyEntity.clean()
      await licence.clean()
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

  return {
    record: companyContact,
    clean: async () => {
      await companyContact.$query().delete()
      await contact.$query().delete()
    }
  }
}

/**
 * This simulates a contact being linked to multiple companies through company contacts
 *
 * @private
 */
async function _additionalCompanyContact(additionalContact) {
  const additionalCompanyContact = await CompanyContactHelper.add({ contactId: additionalContact.record.contactId })

  return {
    record: additionalCompanyContact,
    clean: async () => {
      await additionalCompanyContact.$query().delete()
    }
  }
}

async function _basicUser(companyId, companyEntityId, name) {
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

async function _primaryUser(companyId, companyEntityId, name) {
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

async function _returnsUser(companyId, companyEntityId, name) {
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

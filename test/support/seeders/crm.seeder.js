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

  const companyEntity = await _licenceCompanyEntity(company)

  const licence = await _licence(company)

  const licenceDocumentHeader = await _licenceDocumentHeader(company, companyEntity, licence)

  const companyId = company.record.id
  const companyEntityId = companyEntity.record.id

  const abstractionAlerts = await _additionalContact(companyId, 'Gilderoy Lockhart', true)
  const additionalContact = await _additionalContact(companyId, 'Horace Slughorn')
  const basicUser = await _licenceEntity(companyId, companyEntityId, 'user', 'Minerva McGonagall')
  const billing = await _billing(companyId)
  const primaryUser = await _licenceEntity(companyId, companyEntityId, 'primary_user', 'Albus Dumbledore')
  const returnsTo = await _returnsTo(company.record)
  const returnsUser = await _licenceEntity(companyId, companyEntityId, 'user_returns', 'Severus Snape')

  // TODO: add another licence the same company - in the header ?
  // Another external 'user' - linked by the - add a new licence document header - with new company entity (needa new compnay entitiy - use that id in the document header)

  return {
    abstractionAlerts,
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
      await additionalContact.clean()
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

  // TODO: move this to do this outside - as it's use the other company - pass in the contact id
  const additionalCompanyContact = await CompanyContactHelper.add({ contactId: contact.id })

  return {
    record: companyContact,
    clean: async () => {
      await additionalCompanyContact.$query().delete()
      await companyContact.$query().delete()
      await contact.$query().delete()
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

async function _licenceDocumentHeader(company, companyEntity, licence) {
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    companyEntityId: companyEntity.record.id,
    licenceRef: licence.record.licenceRef
  })

  return {
    record: licenceDocumentHeader,
    clean: async () => {
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
  const licenceEntity = await LicenceEntityHelper.add({
    name,
    type: 'individual'
  })

  // Create the role in the licence entity
  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    role,
    companyEntityId,
    licenceEntityId: licenceEntity.id
  })

  // TODO: Make all the roles their own functions
  if (role === 'user_returns') {
    await LicenceEntityRoleHelper.add({
      role: 'user',
      companyEntityId,
      licenceEntityId: licenceEntity.id
    })
  }

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

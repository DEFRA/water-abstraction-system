'use strict'

/**
 * @module CompantContactsSeeder
 */

const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceDocumentHelper = require('../helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../helpers/licence-document-role.helper.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')
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
  const company = await _company()
  const companyId = company.record.id

  const additionalContact = await _additionalContact(companyId, 'Two flower')
  const abstractionAlerts = await _additionalContact(companyId, 'Granny Weatherwax', true)
  const basicUser = await _user(companyId)

  return {
    abstractionAlerts,
    additionalContact,
    basicUser,
    company,
    clean: async () => {
      await abstractionAlerts.clean()
      await additionalContact.clean()
      await basicUser.clean()
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

async function _user(companyId) {
  const licenceRole = await LicenceRoleHelper.select()

  const licenceDocument = await LicenceDocumentHelper.add()

  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    companyId,
    licenceRoleId: licenceRole.id,
    licenceDocumentId: licenceDocument.id
  })

  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    licenceRef: licenceDocument.licenceRef,
    companyEntityId: generateUUID()
  })

  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    companyEntityId: licenceDocumentHeader.companyEntityId,
    role: 'user'
  })

  const licenceEntity = await LicenceEntityHelper.add({
    id: licenceEntityRole.licenceEntityId
  })

  const user = await UserModel.add({
    licenceEntityId: licenceEntity.id
  })

  return {
    record: user,
    clean: () => {}
  }
}

/**
 * The company will always be the licence holder
 *
 * @private
 */
async function _company() {
  const company = await CompanyHelper.add({
    name: 'Ankh-Morpork'
  })

  return {
    record: company,
    clean: async () => {
      await company.$query().delete()
    }
  }
}

module.exports = {
  seed
}

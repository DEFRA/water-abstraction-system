'use strict'

/**
 * @module CRMContactsSeeder
 */

const AddressHelper = require('../helpers/address.helper.js')
const CompanyHelper = require('../helpers/company.helper.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const LicenceVersionHelper = require('../helpers/licence-version.helper.js')

/**
 * Adds a licence holder (company, address, and licence version holder) to a licence
 *
 * A licence is linked to a company through the licence version, the licence version links the licence, company, and address.
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {string} name - The company name
 * @param {string} [existingRegionId] - The id of the region to assign to the company that will be created
 *
 * @returns {Promise<object>} an object containing all records related to a licence holder
 */
async function licenceHolder(licenceSeedData, name, existingRegionId = null) {
  const regionId = existingRegionId || licenceSeedData.licence.regionId

  const company = await CompanyHelper.add({
    name,
    regionId,
    externalId: CompanyHelper.generateExternalId()
  })

  const address = await AddressHelper.add({
    address1: '4',
    address2: 'Privet Drive',
    address3: 'Little Whinging',
    address4: 'Surrey',
    address5: null,
    address6: null,
    country: null,
    postcode: 'WD25 7LR'
  })

  const licenceVersion = await LicenceVersionHelper.add({
    addressId: address.id,
    companyId: company.id,
    endDate: null,
    licenceId: licenceSeedData.licence.id
  })

  return {
    address,
    company,
    licenceVersion,
    clean: async () => {
      await address.$query().delete()
      await company.$query().delete()
      await licenceVersion.$query().delete()
    }
  }
}

/**
 * Adds a primary user is linked to the licence by the company entity id.
 *
 * We need to update the licence document header company entity id to the newly created company entity
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {string} email - The email for the user
 *
 * @returns {Promise<object>} an object containing all records related to a primary user
 */
async function primaryUser(licenceSeedData, email) {
  const individualEntity = await LicenceEntityHelper.add({ name: email, type: 'individual' })

  const companyEntity = await LicenceEntityHelper.add({ type: 'company' })

  await licenceSeedData.licenceDocumentHeader.$query().patch({
    companyEntityId: companyEntity.id
  })

  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    companyEntityId: companyEntity.id,
    licenceEntityId: individualEntity.id,
    role: 'primary_user'
  })

  return {
    companyEntity,
    individualEntity,
    licenceEntityRole,
    clean: async () => {
      await companyEntity.$query().delete()
      await individualEntity.$query().delete()
      await licenceEntityRole.$query().delete()
    }
  }
}

/**
 * Adds a returns user is linked to the licence by the company entity id.
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {string} email - The email for the user
 *
 * @returns {Promise<object>} an object containing all records related to a primary user
 */
async function returnsUser(licenceSeedData, email) {
  const individualEntity = await LicenceEntityHelper.add({ name: email, type: 'individual' })
  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    companyEntityId: licenceSeedData.licenceDocumentHeader.companyEntityId,
    licenceEntityId: individualEntity.id,
    role: 'user_returns'
  })

  return {
    individualEntity,
    licenceEntityRole,
    clean: async () => {
      await individualEntity.$query().delete()
      await licenceEntityRole.$query().delete()
    }
  }
}

module.exports = {
  licenceHolder,
  primaryUser,
  returnsUser
}

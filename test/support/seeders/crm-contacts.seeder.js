/**
 * @module CRMContactsSeeder
 */

import AddressHelper from '../helpers/address.helper.js'
import CompanyContactHelper from '../helpers/company-contact.helper.js'
import CompanyHelper from '../helpers/company.helper.js'
import ContactHelper from '../helpers/contact.helper.js'
import LicenceDocumentRoleHelper from '../helpers/licence-document-role.helper.js'
import LicenceEntityHelper from '../helpers/licence-entity.helper.js'
import LicenceEntityRoleHelper from '../helpers/licence-entity-role.helper.js'
import LicenceRoleHelper from '../helpers/licence-role.helper.js'
import LicenceVersionHelper from '../helpers/licence-version.helper.js'

/**
 * Add an additional contact
 *
 * An additional contact is
 *
 * @param {object} licenceHolderSeedData - Licence holder (company, address, and licence version) data
 * @param {object} additionalContactSeedData - The additional contact seed data
 * @param {boolean} [abstractionAlerts=true] - Whether the contact has abstraction alerts enabled
 * @param {Date|null} [deletedAt=null] - Whether the contact has been soft deleted
 *
 * @returns {Promise<object>} an object containing all records related to an additional contact
 */
export async function additionalContact(
  licenceHolderSeedData,
  additionalContactSeedData = null,
  abstractionAlerts = true,
  deletedAt = null
) {
  const additionalContact = additionalContactSeedData || {
    firstName: 'Ron',
    lastName: 'Burgundy',
    email: 'Ron.Burgundy@news.com'
  }

  const licenceRole = await LicenceRoleHelper.select('additionalContact')

  const companyContact = await CompanyContactHelper.add({
    companyId: licenceHolderSeedData.company.id,
    licenceRoleId: licenceRole.id,
    abstractionAlerts,
    deletedAt
  })

  const contact = await ContactHelper.add({
    id: companyContact.contactId,
    ...additionalContact
  })

  return {
    companyContact,
    contact,
    licenceRole,
    clean: async () => {
      await companyContact.$query().delete()
      await contact.$query().delete()
    }
  }
}

/**
 * Adds a licence holder (company, address, and licence version holder) to a licence
 *
 * A licence is linked to a company through the licence version, the licence version links the licence, company, and address.
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {string} name - The company name
 * @param {string|null} [existingRegionId] - The id of the region to assign to the company that will be created
 *
 * @param licenceVersionEndDate
 * @returns {Promise<object>} an object containing all records related to a licence holder
 */
export async function licenceHolder(licenceSeedData, name, existingRegionId = null, licenceVersionEndDate = null) {
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
    endDate: licenceVersionEndDate,
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
 * Adds a primary user
 *
 * A primary user is linked to the licence by the company entity id on the licence document header.
 *
 * We need to update the licence document header company entity id to the newly created company entity
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {string} email - The email for the user
 *
 * @returns {Promise<object>} an object containing all records related to a primary user
 */
export async function primaryUser(licenceSeedData, email) {
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
 * Adds a 'returnsTo'
 *
 * We need to handle both a 'returnsTo' linked to the same licence holder as the licence and a 'returnsTo' not related to the licence holder
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {object} licenceHolderSeedData - The licence holder seed data
 * @param {string} [name] - The company name
 *
 * @returns {Promise<object>} an object containing all records related to a 'returnsTo'
 */
export async function returnsTo(licenceSeedData, licenceHolderSeedData, name) {
  let company = licenceHolderSeedData.company
  let address = licenceHolderSeedData.address

  // If the name is provided, create a new company and address - a 'returnsTo' not related to the licence holder
  if (name) {
    company = await CompanyHelper.add({
      name
    })

    address = await AddressHelper.add({
      address1: '7',
      address2: 'Privet Drive',
      address3: 'Little Whinging',
      address4: 'Surrey',
      address5: null,
      address6: null,
      country: null,
      postcode: 'WD25 7LR'
    })
  }
  const licenceRole = LicenceRoleHelper.select('returnsTo')

  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    licenceRoleId: licenceRole.id,
    licenceDocumentId: licenceSeedData.licenceDocument.id,
    companyId: company.id,
    addressId: address.id,
    endDate: null
  })

  return {
    address,
    company,
    licenceDocumentRole,
    licenceRole,
    clean: async () => {
      await address.$query().delete()
      await company.$query().delete()
      await licenceDocumentRole.$query().delete()
      await licenceHolderSeedData.clean()
    }
  }
}

/**
 * Adds a returns user
 *
 * A returns user is linked to the licence by the company entity id on the licence document header.
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {string} email - The email for the user
 *
 * @returns {Promise<object>} an object containing all records related to a returns user
 */
export async function returnsUser(licenceSeedData, email) {
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

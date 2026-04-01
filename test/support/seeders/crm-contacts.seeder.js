'use strict'

/**
 * @module CRMContactsSeeder
 */

const AddressHelper = require('../helpers/address.helper.js')
const CompanyHelper = require('../helpers/company.helper.js')
const LicenceVersionHelper = require('../helpers/licence-version.helper.js')

/**
 * Adds a licence holder (company, address, and licence version holder) to a licence
 *
 * A licence is linked to a company through the licence version, the licence version links the licence, company, and address.
 *
 * @param {object} licence - The licence
 * @param {string} name - The company name
 * @param {string} [existingRegionId] - The id of the region to assign to the company that will be created
 *
 * @returns {Promise<object>} an object containing all records related to a licence holder
 */
async function licenceHolder(licence, name, existingRegionId = null) {
  const regionId = existingRegionId || licence.licence.regionId

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
    licenceId: licence.licence.id
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

module.exports = {
  licenceHolder
}

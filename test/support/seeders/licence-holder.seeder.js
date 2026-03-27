'use strict'

/**
 * @module LicenceHolderSeeder
 */

const CompanyHelper = require('../helpers/company.helper.js')
const LicenceVersionHelper = require('../helpers/licence-version.helper.js')

/**
 * Adds a company to the provided licence that is set up to be the licence holder
 *
 * @param {object} licence - The licence or an object representing it, with an `id` and `licenceRef` property
 * @param {string} [name] - The name of the company that will be the licence holder
 * @param {string} [regionId] - The ID of the region to assign to the company that will be created
 *
 * @returns {Promise<object>} an object containing the created `company` and `licenceVersion` records
 */
async function seed(licence, name = 'Licence Holder Ltd', regionId = null) {
  // Create a company record
  const company = await CompanyHelper.add({ externalId: CompanyHelper.generateExternalId(), name, regionId })

  const licenceVersion = await LicenceVersionHelper.add({ companyId: company.id, licenceId: licence.id })

  return {
    company,
    licenceVersion,
    clean: async () => {
      await company.$query().delete()
      await licenceVersion.$query().delete()
    }
  }
}

module.exports = {
  seed
}

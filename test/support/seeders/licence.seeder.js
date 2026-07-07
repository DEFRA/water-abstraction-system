/**
 * @module LicenceSeeder
 */

import CompanyHelper from '../helpers/company.helper.js'
import LicenceHelper from '../helpers/licence.helper.js'
import LicenceVersionHelper from '../helpers/licence-version.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

/**
 * Seeds a licence holder that is the current licence version holder for two licences
 *
 * @returns {Promise<object>} an object containing the company, both licences and their versions, and a clean function
 */
async function licenceHolderWithMultipleLicences() {
  const { company, licence, licenceVersion } = await licenceHolderWithSingleLicence()

  const licenceTwo = await LicenceHelper.add()
  const licenceVersionTwo = await LicenceVersionHelper.add({ licenceId: licenceTwo.id, companyId: company.id })

  return {
    company,
    licenceOne: {
      licence,
      licenceVersion
    },
    licenceTwo: {
      licence: licenceTwo,
      licenceVersion: licenceVersionTwo
    },
    clean: async () => {
      await company.$query().delete()
      await licenceVersion.$query().delete()
      await licenceVersionTwo.$query().delete()
      await licence.$query().delete()
      await licenceTwo.$query().delete()
    }
  }
}

/**
 * Seeds a licence holder that was once the licence version holder for a licence but no longer is
 *
 * A second, more recent licence version is added to the same licence but with a different company ID, making the
 * seeded company an ex-holder rather than the current holder.
 *
 * @returns {Promise<object>} an object containing the company, the licence, both licence versions, and a clean function
 */
async function exLicenceHolderWithSingleLicences() {
  const { clean, ...licenceHolder } = await licenceHolderWithSingleLicence()

  const newerLicenceVersion = await LicenceVersionHelper.add({
    licenceId: licenceHolder.licence.id,
    issue: 2,
    companyId: generateUUID()
  })

  return {
    ...licenceHolder,
    newerLicenceVersion,
    clean: async () => {
      await newerLicenceVersion.$query().delete()
      await clean()
    }
  }
}

/**
 * Seeds a licence holder that is the current licence version holder for a single licence
 *
 * @param {object} [data={}] - Additional data to pass to the licence helper when creating the licence
 *
 * @returns {Promise<object>} an object containing the company, licence, licence version, and a clean function
 */
async function licenceHolderWithSingleLicence(data = {}) {
  const company = await CompanyHelper.add()

  const licence = await LicenceHelper.add(data)
  const licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id, companyId: company.id })

  return {
    company,
    licence,
    licenceVersion,
    clean: async () => {
      await licenceVersion.$query().delete()
      await licence.$query().delete()
      await company.$query().delete()
    }
  }
}

export default {
  exLicenceHolderWithSingleLicences,
  licenceHolderWithMultipleLicences,
  licenceHolderWithSingleLicence
}

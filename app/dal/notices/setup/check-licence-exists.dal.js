/**
 * Checks whether a licence exists for the given licence reference.
 * @module CheckLicenceExistsDal
 */

import LicenceModel from '../../../models/licence.model.js'

/**
 * Checks whether a licence exists for the given licence reference.
 *
 * @param {string} licenceRef - The licence reference to check
 *
 * @returns {Promise<boolean>} Whether a matching licence exists in the database
 */
export default async function checkLicenceExistsDal(licenceRef) {
  const licence = await LicenceModel.query().where('licenceRef', licenceRef).select('licenceRef').limit(1).first()

  return !!licence
}

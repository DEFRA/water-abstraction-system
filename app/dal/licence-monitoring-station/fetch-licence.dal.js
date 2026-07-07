/**
 * Fetches a licence for the given licence reference with the data needed to determine if it has ended.
 *
 * @module FetchLicenceDal
 */

import LicenceModel from '../../models/licence.model.js'

/**
 * Fetches a licence for the given licence reference with the data needed to determine if it has ended.
 *
 * @param {string} licenceRef - The licence reference to fetch
 *
 * @returns {Promise<object>} The licence with the data needed to determine if it has ended (expiredDate,
 * lapsedDate, revokedDate)
 */
async function go(licenceRef) {
  return LicenceModel.query().where('licenceRef', licenceRef).select('id', 'licenceRef').modify('ended').first()
}

export default {
  go
}

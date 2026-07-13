/**
 * Fetches a licence for the given licence reference with the data for a renewal.
 * @module FetchRenewalLicenceDal
 */

import LicenceModel from '../../../models/licence.model.js'

/**
 * Fetches a licence for the given licence reference with the data for a renewal.
 *
 * @param {string} licenceRef - The licence reference to check
 *
 * @returns {Promise<object>} The licence with the data for a renewal (expiredDate, revokedDate, lapsedDate)
 */
export default async function fetchRenewalLicence(licenceRef) {
  return LicenceModel.query()
    .where('licenceRef', licenceRef)
    .select(['id', 'licenceRef', 'expiredDate', 'revokedDate', 'lapsedDate'])
    .limit(1)
    .first()
}

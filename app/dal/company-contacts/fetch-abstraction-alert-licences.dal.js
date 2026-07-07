/**
 * Fetch all licences for abstraction alert licences ids
 * @module FetchAbstractionAlertLicencesDal
 */

import LicenceModel from '../../models/licence.model.js'

/**
 * Fetch all licences for abstraction alert licences ids
 *
 * @param {string[]|null} abstractionAlertLicences - The UUIDs of the abstraction alert licences
 *
 * @returns {Promise<object[]>} An array of licences
 */
async function go(abstractionAlertLicences) {
  if (abstractionAlertLicences === null) {
    return []
  }

  return LicenceModel.query()
    .select(['id', 'licenceRef', 'revokedDate', 'lapsedDate', 'expiredDate'])
    .whereIn('id', abstractionAlertLicences)
    .orderBy('licenceRef')
}

export {
  go
}
export default {
  go
}

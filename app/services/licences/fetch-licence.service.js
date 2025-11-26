'use strict'

/**
 * Fetches the matching licence for the view '/licences/{id}/*' pages
 * @module FetchLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')
const { db } = require('../../../db/db.js')

/**
 * Fetches the matching licence for the view '/licences/{id}/*' pages
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the matching `LicenceModel`
 */
async function go(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'expiredDate',
      'id',
      'lapsedDate',
      'licenceRef',
      'includeInPresrocBilling',
      'includeInSrocBilling',
      'revokedDate',
      db.raw(`
      (
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM public.licence_supplementary_years lsy
            WHERE lsy.licence_id = licences.id
          )
          THEN TRUE
          ELSE FALSE
        END
      ) AS "includeInTwoPartTariffBilling"
    `)
    ])
}

module.exports = {
  go
}

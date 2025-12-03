'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 * @module FetchHistoryService
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')
const { raw } = require('objection')

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceVersionModel>} the licence versions
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceVersionModel.query()
    .where('licenceId', licenceId)
    .select([
      'endDate',
      'id',
      'startDate',
      raw(
        '(SELECT true FROM public.licence_versions lv2 WHERE lv2.licence_id = licence_versions.licence_id AND lv2.issue = licence_versions.issue AND lv2."increment" = (licence_versions."increment" - 1))'
      ).as('administrative')
    ])
    .modify('history')
}

module.exports = {
  go
}

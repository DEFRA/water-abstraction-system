'use strict'

/**
 * Fetches licence versions data needed for the view '/licences/{id}/set-up` page
 * @module FetchLicenceVersionsService
 */

const { raw } = require('objection')

const LicenceVersionModel = require('../../models/licence-version.model.js')

/**
 * Fetches licence versions data needed for the view '/licences/{id}/set-up` page
 *
 * @param {string} licenceId - The licence UUID for the licence to fetch licence versions for
 *
 * @returns {Promise<object>} the licence versions needed to populate the view licence page's set up tab
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceVersionModel.query()
    .select([
      'endDate',
      'id',
      'startDate',
      raw(
        '(SELECT true FROM public.licence_versions lv2 WHERE lv2.licence_id = licence_versions.licence_id AND lv2.issue = licence_versions.issue AND lv2."increment" = (licence_versions."increment" - 1))'
      ).as('administrative')
    ])
    .where('licenceId', licenceId)
    .orderBy([
      { column: 'startDate', order: 'desc' },
      { column: 'issue', order: 'desc' },
      { column: 'increment', order: 'desc' }
    ])
    .withGraphFetched('modLogs')
    .modifyGraph('modLogs', (builder) => {
      builder.select(['id', 'reasonDescription']).orderBy('externalId', 'asc')
    })
}

module.exports = {
  go
}

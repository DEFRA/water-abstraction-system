'use strict'

/**
 * Fetches data needed for the view `/licence-versions/{id}` page
 * @module FetchLicenceVersionService
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')
const { raw } = require('objection')

/**
 * Fetches data needed for the view `/licence-versions/{id}` page
 *
 * @param {string} licenceVersionId - The UUID for the licence version to fetch
 *
 * @returns {Promise<object>} an object with the licence version and the licence versions for pagination
 */
async function go(licenceVersionId) {
  return {
    licenceVersion: await _fetch(licenceVersionId),
    licenceVersionsForPagination: await _fetchPagination(licenceVersionId)
  }
}

async function _fetchPagination(licenceVersionId) {
  return LicenceVersionModel.query()
    .where('licenceId', LicenceVersionModel.query().select('licenceId').findById(licenceVersionId))
    .select(['id', 'startDate'])
    .orderBy('startDate', 'asc')
}

async function _fetch(licenceVersionId) {
  return LicenceVersionModel.query()
    .findById(licenceVersionId)
    .select([
      'id',
      'startDate',
      'endDate',
      raw(
        '(SELECT true FROM public.licence_versions lv2 WHERE lv2.licence_id = licence_versions.licence_id AND lv2.issue = licence_versions.issue AND lv2."increment" = (licence_versions."increment" - 1))'
      ).as('administrative')
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select(['id', 'licenceRef'])
    })
    .modify('history')
}

module.exports = {
  go
}

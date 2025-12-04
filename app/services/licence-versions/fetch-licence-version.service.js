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
 * @returns {Promise<module:LicenceVersionModel>} the licence version
 */
async function go(licenceVersionId) {
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

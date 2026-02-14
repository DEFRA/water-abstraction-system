'use strict'

/**
 * Fetches the licences, related to a company, data needed for the view '/companies/{id}/licences'
 * @module FetchLicencesService
 */

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches the licences, related to a company, data needed for the view '/companies/{id}/licences'
 *
 * @param {string} companyId - The company id for the company
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the licences for the company and the pagination object
 */
async function go(companyId, page) {
  const { results, total } = await _fetch(companyId, page)

  return { licences: results, pagination: { total } }
}

async function _fetch(companyId, page) {
  return LicenceModel.query()
    .select(['expiredDate', 'id', 'lapsedDate', 'licenceRef', 'revokedDate', 'startDate'])
    .whereExists(
      LicenceModel.relatedQuery('licenceDocument')
        .innerJoinRelated('licenceDocumentRoles')
        .innerJoin('licenceRoles', 'licenceRoles.id', 'licenceDocumentRoles.licenceRoleId')
        .where('licenceDocumentRoles.companyId', companyId)
        .where('licenceRoles.name', 'licenceHolder')
    )
    .withGraphFetched('licenceDocument')
    .modifyGraph('licenceDocument', (licenceDocumentBuilder) => {
      licenceDocumentBuilder
        .select(['id', 'licenceRef'])
        .withGraphFetched('licenceDocumentRoles')
        .modifyGraph('licenceDocumentRoles', (licenceDocumentRolesBuilder) => {
          licenceDocumentRolesBuilder
            .select(['endDate', 'id', 'startDate', 'endDate'])
            .where('companyId', companyId)
            .orderBy([
              { column: 'licenceRoleId', order: 'asc' },
              { column: 'startDate', order: 'desc' }
            ])
            .withGraphFetched('licenceRole')
            .modifyGraph('licenceRole', (licenceRoleBuilder) => {
              licenceRoleBuilder.select(['id', 'label', 'name'])
            })
        })
    })
    .orderBy('licenceRef', 'asc')
    .page(page - 1, DatabaseConfig.defaultPageSize)
}
module.exports = {
  go
}

'use strict'

/**
 * Fetches licences linked to a user for display on the `/users/external/{id}/licences` page
 * @module FetchLicencesDal
 */

const LicenceModel = require('../../../models/licence.model.js')

const DatabaseConfig = require('../../../../config/database.config.js')

/**
 * Fetches licences linked to a user for display on the `/users/external/{id}/licences` page
 *
 * This includes their related roles and current licence holder, so we can display these alongside the licence.
 *
 * @param {number} licenceEntityId - The licence entity ID of the requested user
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<module:LicenceModel[]>} the requested user licences
 */
async function go(licenceEntityId, page = '1') {
  const { results: licences, total: totalNumber } = await _fetch(licenceEntityId, page)

  return { licences, totalNumber }
}

async function _fetch(licenceEntityId, page) {
  return LicenceModel.query()
    .select([
      'licences.expiredDate',
      'licences.id',
      'licences.lapsedDate',
      'licences.licenceRef',
      'licences.revokedDate'
    ])
    .innerJoinRelated('licenceDocumentHeader')
    .whereRaw(
      `EXISTS (
  SELECT
    1
  FROM
    public.licence_entity_roles ler
  WHERE
    ler.company_entity_id = "licence_document_header".company_entity_id
    AND ler.licence_entity_id = ?
)
      `,
      [licenceEntityId]
    )
    .orderBy('licences.licenceRef', 'asc')
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (licenceVersionsBuilder) => {
      licenceVersionsBuilder
        .select(['id', 'licenceId'])
        .distinctOn('licenceId')
        .orderBy('licenceId')
        .orderBy('issue', 'desc')
        .orderBy('increment', 'desc')
        .withGraphFetched('licenceVersionHolder')
        .modifyGraph('licenceVersionHolder', (licenceVersionHolderBuilder) => {
          licenceVersionHolderBuilder.select(['derivedName', 'id', 'licenceVersionId'])
        })
    })
    .withGraphFetched('licenceDocumentHeader')
    .modifyGraph('licenceDocumentHeader', (licenceDocumentHeaderBuilder) => {
      licenceDocumentHeaderBuilder
        .select(['id', 'licenceRef'])
        .withGraphFetched('licenceEntityRoles')
        .modifyGraph('licenceEntityRoles', (licenceEntityRolesBuilder) => {
          licenceEntityRolesBuilder
            .select(['id', 'role'])
            .where('licenceEntityId', licenceEntityId)
            .orderBy('role', 'asc')
        })
    })
}

module.exports = {
  go
}

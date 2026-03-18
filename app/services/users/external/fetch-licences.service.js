'use strict'

/**
 * Fetches licences linked to a user for display on the `/users/external/{id}` page
 * @module FetchLicencesService
 */

const LicenceModel = require('../../../models/licence.model.js')

/**
 * Fetches licences linked to a user for display on the `/users/external/{id}` page
 *
 * This includes their related roles and current licence holder, so we can display these alongside the licence.
 *
 * @param {number} licenceEntityId - The licence entity ID of the requested user
 *
 * @returns {Promise<module:LicenceModel[]>} the requested user licences
 */
async function go(licenceEntityId) {
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

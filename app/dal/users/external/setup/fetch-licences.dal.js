/**
 * Fetches licences linked to a user for for the external unlink licence journey
 * @module FetchLicencesDal
 */

import LicenceModel from '../../../../models/licence.model.js'

/**
 * Fetches licences linked to a user for for the external unlink licence journey
 *
 * This includes their current licence holder, so we can display this alongside the licence.
 *
 * @param {number} licenceEntityId - The licence entity ID of the requested user
 *
 * @returns {Promise<module:LicenceModel[]>} the requested user licences
 */
export default async function fetchLicencesDal(licenceEntityId) {
  return LicenceModel.query()
    .select(['licences.id', 'licences.licenceRef', 'licenceDocumentHeader.id AS licenceDocumentHeaderId'])
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
    .modify('licenceHolder')
}

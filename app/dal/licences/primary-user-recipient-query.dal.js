'use strict'

/**
 * SQL query fragment for fetching primary user recipients from licence document headers
 * @module PrimaryUserRecipientQueryDal
 */

const primaryUserRecipientQuery = `
    SELECT
      ('primary user') AS contact_type,
      1 AS priority,
      NULL::jsonb AS contact,
      md5(LOWER(le."name")) AS contact_hash_id,
      le."name" AS email,
      ldh.licence_ref,
      ('Email') AS message_type
    FROM public.licence_document_headers ldh
    INNER JOIN public.licence_entity_roles ler
      ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
    INNER JOIN public.licence_entities le
      ON le.id = ler.licence_entity_id
`

module.exports = {
  primaryUserRecipientQuery
}
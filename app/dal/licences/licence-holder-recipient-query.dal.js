'use strict'

/**
 * SQL query fragment for fetching licence holder recipients from licence versions
 * @module LicenceHolderRecipientQueryDal
 */

const licenceHolderRecipientQuery = `
    SELECT
      ('licence holder') AS contact_type,
      2 AS priority,
      jsonb_build_object(
        'name', c.name,
        'address1', a.address_1,
        'address2', a.address_2,
        'address3', a.address_3,
        'address4', a.address_4,
        'address5', a.address_5,
        'address6', a.address_6,
        'postcode', a.postcode,
        'country', a.country
      ) AS contact,
      MD5(LOWER(CONCAT(
        c.name,
        a.address_1,
        a.address_2,
        a.address_3,
        a.address_4,
        a.address_5,
        a.address_6,
        a.postcode,
        a.country
      ))) AS contact_hash_id,
      NULL::TEXT AS email,
      l.licence_ref,
      ('Letter') AS message_type
    FROM
      public.licences l
    INNER JOIN (
      SELECT DISTINCT ON (lv.licence_id)
        lv.licence_id,
        lv.company_id,
        lv.address_id
      FROM
        public.licence_versions lv
      WHERE
        lv.start_date <= CURRENT_DATE
      ORDER BY
        lv.licence_id ASC,
        lv."issue" DESC,
        lv."increment" DESC,
        lv.end_date DESC NULLS FIRST
    ) AS llv ON llv.licence_id = l.id
    INNER JOIN public.companies c ON c.id = llv.company_id
    INNER JOIN public.addresses a ON a.id = llv.address_id
`

module.exports = {
  licenceHolderRecipientQuery
}

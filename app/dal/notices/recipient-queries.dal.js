/**
 * SQL join fragment for fetching the current licence version
 *
 * Consumers must include `FROM public.licences l` before this fragment.
 */
export const currentLicenceVersionsJoin = `
  INNER JOIN (
    SELECT DISTINCT ON (lv.licence_id)
      lv.licence_id,
      lv.company_id,
      lv.address_id,
      lv.end_date
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
`

/**
 * SQL query fragment for fetching additional contact recipients
 *
 * A company contact becomes an additional contact recipient when `abstraction_alerts = true` on the
 * `company_contacts` record. Whether they receive alerts for a specific licence depends on
 * `abstraction_alert_licences`:
 *
 * - `abstraction_alert_licences IS NULL`: the contact receives alerts for all licences held by their company
 * - `abstraction_alert_licences` contains the licence ID: the contact receives alerts only for those licences
 *
 * When `abstraction_alerts = false` the contact is excluded regardless of `abstraction_alert_licences`.
 *
 * Requires 1 binding: licenceRefs
 */
export const additionalContactRecipientQuery = `
  SELECT DISTINCT
    l.licence_ref,
    'additional contact' AS contact_type,
    con.email,
    NULL::jsonb AS contact,
    md5(LOWER(con.email)) AS contact_hash_id,
    ('Email') as message_type
  FROM
    public.licences l
    ${currentLicenceVersionsJoin}
    INNER JOIN public.companies c ON c.id = llv.company_id
    INNER JOIN public.company_contacts cct ON cct.company_id = llv.company_id
    INNER JOIN public.contacts con ON con.id = cct.contact_id
  WHERE
    l.licence_ref = ANY (?)
    AND (
      llv.end_date IS NULL
      OR llv.end_date >= CURRENT_DATE
    )
    AND cct.abstraction_alerts = true
    AND cct.deleted_at IS NULL
    AND ( cct.abstraction_alert_licences IS NULL OR cct.abstraction_alert_licences @> jsonb_build_array(l.id::text))
  `

/**
 * SQL query fragment for fetching licence holder recipients from licence versions
 *
 */
export const licenceHolderRecipientQuery = `
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
    ${currentLicenceVersionsJoin}
    INNER JOIN public.companies c ON c.id = llv.company_id
    INNER JOIN public.addresses a ON a.id = llv.address_id
`

/**
 * SQL query fragment for fetching primary user recipients from licence document headers
 *
 */
export const primaryUserRecipientQuery = `
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

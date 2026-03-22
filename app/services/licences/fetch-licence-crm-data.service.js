'use strict'

/**
 * Fetches the contacts for a licence for the view '/licences/{id}/contact-details' page
 * @module FetchLicenceCRMDataService
 */

const DatabaseConfig = require('../../../config/database.config.js')
const { db } = require('../../../db/db.js')

/**
 * Fetches the contacts for a licence for the view '/licences/{id}/contact-details' page
 *
 * @param {string} licenceId - The UUID of the licence to fetch
 * @param {string[]} roles - An array of user roles used to determine which contact details can be shown
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object[]>} the contacts for the licence
 */
async function go(licenceId, roles, page = '1') {
  const authorisedForBilling = roles.includes('billing')

  const [{ rows: contacts }, { rows: totalNumber }] = await Promise.all([
    await _fetch(authorisedForBilling, licenceId, page),
    await _fetchCount(authorisedForBilling, licenceId)
  ])

  return { contacts, totalNumber: totalNumber.length }
}

async function _fetchCount(authorisedForBilling, licenceId) {
  const params = [licenceId, authorisedForBilling]

  const query = _query()

  return db.raw(query, params)
}

async function _fetch(authorisedForBilling, licenceId, page) {
  const pageSize = DatabaseConfig.defaultPageSize
  const currentPage = Number(page)

  // Calculate offset: Page 1 skips 0, Page 2 skips 25, etc.
  const offset = (currentPage - 1) * pageSize

  const params = [licenceId, authorisedForBilling, pageSize, offset]

  const paginationAndOrderBy = `
  ORDER BY
    r."contactName" ASC,
    r."contactType" ASC
  LIMIT ? OFFSET ?
  `

  const query = _query(paginationAndOrderBy)

  return db.raw(query, params)
}

function _query(paginationAndOrderBy = '') {
  return `
    WITH licence AS (
      SELECT
        id AS licence_id,
        l.licence_ref
      FROM
        public.licences l
      WHERE l.id = ?
    ),
    latest_charge_version AS (
      SELECT DISTINCT ON (cv.licence_id)
        cv.licence_id,
        cv.billing_account_id
      FROM
        public.charge_versions cv
      INNER JOIN licence l
        ON l.licence_id = cv.licence_id
      WHERE
        cv.status <> 'superseded'
      ORDER BY
        cv.licence_id,
        cv.start_date DESC,
        cv.end_date DESC NULLS FIRST
    ),
    external_users AS (
      SELECT DISTINCT ON (ler.id)
        l.licence_id,
        u.id as id,
        ler.licence_entity_id,
        u.username AS contact_name,
        ler."role"
      FROM
        public.licence_entity_roles ler
      INNER JOIN public.users u
        ON u.licence_entity_id = ler.licence_entity_id
      INNER JOIN public.licence_document_headers ldh
        ON ldh.company_entity_id = ler.company_entity_id
      INNER JOIN licence l
        ON l.licence_ref = ldh.licence_ref
    ),
    licence_holder AS (
      SELECT
        lvh.company_id AS id,
        lvh.derived_name AS "contactName",
        'licence-holder' AS "contactType",
        lvh.address_id AS "addressId"
      FROM
        public.licence_versions lv
      INNER JOIN public.licence_version_holders lvh
        ON lv.id = lvh.licence_version_id
      INNER JOIN licence l
        ON l.licence_id = lv.licence_id
      ORDER BY
        lv.issue DESC,
        lv.increment DESC
      LIMIT 1
    ),
    all_company_contacts AS (
      SELECT
        cc.id AS id,
        cc.abstraction_alerts,
        (CASE
          WHEN con.contact_type = 'department' THEN
            con.department
          ELSE
            concat_ws(
              ' ',
              con.salutation,
              (CASE
                WHEN con.initials IS NULL THEN con.first_name
                ELSE con.initials
              END),
              con.last_name
            )
        END) AS contact_name
      FROM
        public.company_contacts cc
      INNER JOIN public.contacts con
        ON con.id = cc.contact_id
      INNER JOIN public.licence_roles lr
        ON lr.id = cc.licence_role_id
      INNER JOIN licence_holder lh
        ON lh.id = cc.company_id
      WHERE
        lr."name" = 'additionalContact'
        AND cc.deleted_at IS NULL
    ),
    returns_to AS (
      SELECT
        cmp.id AS id,
        cmp."name" AS "contactName",
        'returns-to' AS "contactType",
        ldr.address_id AS "addressId"
      FROM
        public.licence_document_roles ldr
      INNER JOIN public.licence_documents ld
        ON ld.id = ldr.licence_document_id
      INNER JOIN public.licence_roles lr
        ON ldr.licence_role_id = lr.id
      INNER JOIN public.companies cmp
        ON ldr.company_id = cmp.id
      INNER JOIN licence l
        ON l.licence_ref = ld.licence_ref
      WHERE
        lr."name" = 'returnsTo'
        AND (
          ldr.end_date >= CURRENT_DATE
          OR ldr.end_date IS NULL
        )
    ),
    billing_accounts AS (
      SELECT
        ba.id AS id,
        ba.account_number AS "contactName",
        'billing' AS "contactType",
        null::UUID AS "addressId"
      FROM
        public.billing_accounts ba
      INNER JOIN latest_charge_version lcv
        ON lcv.billing_account_id = ba.id
      WHERE TRUE = ?
    ),
    abstraction_alerts AS (
      SELECT
        acc.id,
        acc.contact_name AS "contactName",
        'abstraction-alerts' AS "contactType",
        null::UUID AS "addressId"
      FROM
        all_company_contacts acc
      WHERE
        acc.abstraction_alerts = TRUE
    ),
    additional_contacts AS (
      SELECT
        acc.id,
        acc.contact_name AS "contactName",
        'additional-contact' AS "contactType",
        null::UUID AS "addressId"
      FROM
        all_company_contacts acc
      WHERE
        acc.abstraction_alerts = FALSE
    ),
    primary_users AS (
      SELECT
        eu.id,
        eu.contact_name AS "contactName",
        'primary-user' AS "contactType",
        null::UUID AS "addressId"
      FROM
        external_users eu
      WHERE
        eu."role" = 'primary_user'
    ),
    returns_users AS (
      SELECT
        eu.id,
        eu.contact_name AS "contactName",
        'returns-user' AS "contactType",
        null::UUID AS "addressId"
      FROM
        external_users eu
      WHERE
        eu."role" = 'user_returns'
        AND NOT EXISTS (
          SELECT
            1
          FROM
            external_users eu2
          WHERE
            eu2.licence_entity_id = eu.licence_entity_id
            AND eu2."role" = 'primary_user'
        )
    ),
    basic_users AS (
      SELECT
        eu.id,
        eu.contact_name AS "contactName",
        'basic-user' AS "contactType",
        null::UUID AS "addressId"
      FROM
        external_users eu
      WHERE
        eu."role" = 'user'
        AND NOT EXISTS (
          SELECT
            1
          FROM
            external_users eu2
          WHERE
            eu2.licence_entity_id = eu.licence_entity_id
            AND eu2."role" != 'user'
        )
    ),
    results AS (
      SELECT * FROM licence_holder
      UNION ALL
      SELECT * FROM returns_to
      UNION ALL
      SELECT * FROM billing_accounts
      UNION ALL
      SELECT * FROM abstraction_alerts
      UNION ALL
      SELECT * FROM additional_contacts
      UNION ALL
      SELECT * FROM primary_users
      UNION ALL
      SELECT * FROM returns_users
      UNION ALL
      SELECT * FROM basic_users
    )
    SELECT
      *
    FROM
      results r
    ${paginationAndOrderBy}
    ;
  `
}

module.exports = {
  go
}

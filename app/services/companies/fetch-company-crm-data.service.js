'use strict'

/**
 * Fetches the contacts data needed for the view '/companies/{id}/contacts'
 * @module FetchCompanyCRMDataService
 */

const { db } = require('../../../db/db.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the contacts data needed for the view '/companies/{id}/contacts'
 *
 * @param {string} companyId - The company id for the company
 * @param {string[]} roles - roles
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} the contacts for the company
 */
async function go(companyId, roles, page = '1') {
  const authorisedForBilling = roles.includes('billing')

  const [{ rows: contacts }, { rows: totalNumber }] = await Promise.all([
    await _fetch(companyId, authorisedForBilling, page),
    await _fetchCount(companyId, authorisedForBilling)
  ])

  return { contacts, totalNumber: totalNumber.length }
}

async function _fetchCount(companyId, billingRole) {
  const params = [companyId, billingRole]

  const query = _query()

  return db.raw(query, params)
}

async function _fetch(companyId, billingRole, page) {
  const pageSize = DatabaseConfig.defaultPageSize
  const currentPage = Number(page)

  // Calculate offset: Page 1 skips 0, Page 2 skips 25, etc.
  const offset = (currentPage - 1) * pageSize

  const params = [companyId, billingRole, pageSize, offset]

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
  WITH company AS (
    SELECT
      id AS company_id
    FROM
      public.companies c
    WHERE
      c.id = ?
  ),
  company_licences AS (
    SELECT
      l.id,
      l.licence_ref
    FROM
      public.licences l
    WHERE EXISTS (
      SELECT
        1
      FROM
        public.licence_versions lv
      INNER JOIN public.licence_version_holders lvh
        ON lvh.licence_version_id = lv.id
      INNER JOIN company c
        ON c.company_id = lvh.company_id
      WHERE lv.licence_id = l.id
    )
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
    INNER JOIN company c
      ON c.company_id = cc.company_id
    WHERE
      lr."name" = 'additionalContact'
  ),
  external_users AS (
    SELECT DISTINCT ON (ler.id)
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
    INNER JOIN company_licences cl
      ON cl.licence_ref = ldh.licence_ref
  ),
  licence_holders AS (
    SELECT
      cmp.id as id,
      cmp."name" AS "contactName",
      'licence-holder' AS "contactType"
    FROM
      public.companies cmp
    INNER JOIN company c
      ON c.company_id = cmp.id
  ),
  returns_to AS (
    SELECT DISTINCT ON (ldr.company_id)
      cmp.id as id,
      cmp."name" AS "contactName",
      'returns-to' AS "contactType"
    FROM
      public.licence_document_roles ldr
    INNER JOIN public.licence_roles lr
      ON lr.id = ldr.licence_role_id
    INNER JOIN public.companies cmp
      ON cmp.id = ldr.company_id
    INNER JOIN company c
      ON c.company_id = ldr.company_id
    WHERE
      lr."name" = 'returnsTo'
      AND (
        ldr.end_date IS NULL
        OR ldr.end_date >= CURRENT_DATE
      )
  ),
  billing_accounts AS (
    SELECT
      ba.id AS id,
      ba.account_number AS "contactName",
      'billing' AS "contactType"
    FROM
      public.billing_accounts ba
    INNER JOIN company c
      ON c.company_id = ba.company_id
    WHERE TRUE = ?
  ),
  abstraction_alerts AS (
    SELECT
      acc.id,
      acc.contact_name AS "contactName",
      'abstraction-alerts' AS "contactType"
    FROM
      all_company_contacts acc
    WHERE
      acc.abstraction_alerts = TRUE
  ),
  additional_contacts AS (
    SELECT
      acc.id,
      acc.contact_name AS "contactName",
      'additional-contact' AS "contactType"
    FROM
      all_company_contacts acc
    WHERE
      acc.abstraction_alerts = FALSE
  ),
  primary_users AS (
    SELECT
      eu.id,
      eu.contact_name AS "contactName",
      'primary-user' AS "contactType"
    FROM
      external_users eu
    WHERE
      eu."role" = 'primary_user'
  ),
  returns_users AS (
    SELECT
      eu.id,
      eu.contact_name AS "contactName",
      'returns-user' AS "contactType"
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
      'basic-user' AS "contactType"
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
    SELECT * FROM licence_holders
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
  ;`
}

module.exports = {
  go
}

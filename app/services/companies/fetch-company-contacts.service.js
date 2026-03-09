'use strict'

/**
 * Fetches the company contacts data needed for the view '/companies/{id}/contacts'
 * @module FetchCompanyContactsService
 */

const { db } = require('../../../db/db.js')

/**
 * Fetches the company contacts data needed for the view '/companies/{id}/contacts'
 *
 * @param {string} companyId - The company id for the company
 *
 * @returns {Promise<object>} the company contacts for the company
 */
async function go(companyId) {
  const { rows: companyContacts } = await _fetch(companyId)

  return { companyContacts, totalNumber: companyContacts.length }
}

async function _fetch(companyId) {
  const params = [companyId, companyId, companyId, companyId, companyId, companyId, companyId, companyId]

  const query = `
    WITH abstraction_alerts AS (
      SELECT
        cc.id AS id,
        con.department AS name,
        'abstraction-alerts' AS contact_type
      FROM public.company_contacts cc
        INNER JOIN public.contacts con ON con.id = cc.contact_id
        INNER JOIN public.licence_roles lr ON lr.id = cc.licence_role_id
      WHERE cc.company_id = ?
      AND cc.abstraction_alerts = true
    ),
     additional_contacts AS (
      SELECT
        cc.id AS id,
        con.department AS name,
        'additional-contact' AS contact_type
      FROM public.company_contacts cc
        INNER JOIN public.contacts con ON con.id = cc.contact_id
        INNER JOIN public.licence_roles lr ON lr.id = cc.licence_role_id
      WHERE cc.company_id = ?
      AND cc.abstraction_alerts = false
    ),
     basic_users AS (
      SELECT
        u.id::UUID as id,
        u.username AS name,
        'basic-user' AS contact_type
      FROM public.licence_document_roles ldr
        INNER JOIN public.licence_documents ld
            ON ld.id = ldr.licence_document_id
        INNER JOIN public.licence_roles lr
            ON lr.id = ldr.licence_role_id
        INNER JOIN public.licence_document_headers ldh
            ON ldh.licence_ref = ld.licence_ref
        INNER JOIN public.licence_entity_roles ler
            ON ler.company_entity_id = ldh.company_entity_id
            AND  ler.role = 'user'
        INNER JOIN public.licence_entities le
            ON le.id = ler.licence_entity_id
        INNER JOIN public.users u
            ON u.licence_entity_id = le.id
      WHERE ldr.company_id = ?
    ),
     billing_accounts AS (
      SELECT
        ba.id AS id,
        ba.account_number AS name,
        'billing' AS contact_type
      FROM public.billing_accounts ba
      WHERE ba.company_id = ?
    ),
     licence_holders AS (
       SELECT
         c.id as id,
         c.name AS name,
         'licence-holder' AS contact_type
       FROM public.companies c
       WHERE c.id = ?
    ),
     primary_users AS (
      SELECT
        u.id::UUID as id,
        u.username AS name,
        'primary-user' AS contact_type
      FROM public.licence_document_roles ldr
        INNER JOIN public.licence_documents ld
          ON ld.id = ldr.licence_document_id
        INNER JOIN public.licence_roles lr
          ON lr.id = ldr.licence_role_id
        INNER JOIN public.licence_document_headers ldh
          ON ldh.licence_ref = ld.licence_ref
        INNER JOIN public.licence_entity_roles ler
          ON ler.company_entity_id = ldh.company_entity_id
          AND  ler.role = 'primary_user'
        INNER JOIN public.licence_entities le
          ON le.id = ler.licence_entity_id
        INNER JOIN public.users u
          ON u.licence_entity_id = le.id
      WHERE ldr.company_id = ?
    ),
     returns_to AS (
      SELECT DISTINCT ON (ldr.company_id )
        c.id as id,
        c.name AS name,
        'returns-to' AS contact_type
      FROM public.licence_document_roles ldr
        INNER JOIN public.licence_roles lr
            ON lr.id = ldr.licence_role_id
        INNER JOIN public.companies c
            ON c.id = ldr.company_id
      WHERE ldr.company_id = ?
      AND lr.name = 'returnsTo'
    ),
     returns_users AS (
      SELECT
        u.id::UUID as id,
        u.username AS name,
        'returns-user' AS contact_type
      FROM public.licence_document_roles ldr
        INNER JOIN public.licence_documents ld
            ON ld.id = ldr.licence_document_id
        INNER JOIN public.licence_roles lr
            ON lr.id = ldr.licence_role_id
        INNER JOIN public.licence_document_headers ldh
            ON ldh.licence_ref = ld.licence_ref
        INNER JOIN public.licence_entity_roles ler
            ON ler.company_entity_id = ldh.company_entity_id
            AND  ler.role = 'user_returns'
        INNER JOIN public.licence_entities le
            ON le.id = ler.licence_entity_id
        INNER JOIN public.users u
            ON u.licence_entity_id = le.id
      WHERE ldr.company_id = ?
    )
    SELECT * FROM abstraction_alerts
    UNION ALL
    SELECT * FROM additional_contacts
    UNION ALL
    SELECT * FROM basic_users
    UNION ALL
    SELECT * FROM billing_accounts
    UNION ALL
    SELECT * FROM licence_holders
    UNION ALL
    SELECT * FROM primary_users
    UNION ALL
    SELECT * FROM returns_to
    UNION ALL
    SELECT * FROM returns_users;
  `
  // order by name, contact type columns -
  // pagination

  return db.raw(query, params)
}

module.exports = {
  go
}

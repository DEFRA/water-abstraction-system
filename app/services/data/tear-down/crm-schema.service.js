'use strict'

/**
 * Removes all data created for acceptance tests from the crm schemas
 * @module CrmSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  return Promise.all([
    _crmEntityRoles(),
    _crmEntity(),
    _crmDocumentHeader(),
    _crmV2DocumentRoles(),
    _crmV2CompanyAddresses(),
    _crmV2InvoiceAccountAddresses(),
    _crmV2InvoiceAccounts(),
    _crmV2CompanyContacts(),
    _crmV2Companies(),
    _crmV2Addresses(),
    _crmV2Documents(),
    _crmV2Contacts()
  ])
}

async function _crmEntityRoles () {
  return db.raw("delete from crm.entity_roles where created_by = 'acceptance-test-setup';")
}

async function _crmEntity () {
  return db.raw("delete from crm.entity where entity_nm like 'acceptance-test.%' or entity_nm like '%@example.com' or entity_nm like 'regression.tests.%' or entity_nm like 'Big Farm Co Ltd%' or source = 'acceptance-test-setup';")
}

async function _crmDocumentHeader () {
  return db.raw(`
  ALTER TABLE crm.document_header DISABLE TRIGGER ALL;

  delete from crm.document_header where jsonb_path_query_first(metadata, '$.dataType') #>> '{}' = 'acceptance-test-setup';

  ALTER TABLE crm.document_header ENABLE TRIGGER ALL;
  `)
}

async function _crmV2DocumentRoles () {
  return db.raw(`
  ALTER TABLE crm_v2.document_roles DISABLE TRIGGER ALL;

  delete from "crm_v2"."document_roles" where "is_test" = TRUE;

  ALTER TABLE crm_v2.document_roles ENABLE TRIGGER ALL;
  `)
}

async function _crmV2CompanyAddresses () {
  return db.raw(`
  ALTER TABLE crm_v2.company_addresses DISABLE TRIGGER ALL;

  delete from "crm_v2"."company_addresses" where "is_test" = TRUE;

  ALTER TABLE crm_v2.company_addresses ENABLE TRIGGER ALL;
  `)
}

async function _crmV2InvoiceAccountAddresses () {
  return db.raw(`
  ALTER TABLE crm_v2.invoice_account_addresses DISABLE TRIGGER ALL;

  delete from "crm_v2"."invoice_account_addresses" as "iaa" using "crm_v2"."invoice_accounts" as "ia","crm_v2"."companies" as "c" where "c"."is_test" = true and "iaa"."invoice_account_id" = "ia"."invoice_account_id" and "ia"."company_id" = "c"."company_id";
  delete from "crm_v2"."invoice_account_addresses" where "is_test" = TRUE;

  ALTER TABLE crm_v2.invoice_account_addresses ENABLE TRIGGER ALL;
  `)
}

async function _crmV2InvoiceAccounts () {
  return db.raw(`
  ALTER TABLE crm_v2.invoice_accounts DISABLE TRIGGER ALL;

  delete from "crm_v2"."invoice_accounts" as "ia" using "crm_v2"."companies" as "c" where "c"."is_test" = true and "ia"."company_id" = "c"."company_id";

  ALTER TABLE crm_v2.invoice_accounts ENABLE TRIGGER ALL;
  `)
}

async function _crmV2CompanyContacts () {
  return db.raw(`
  ALTER TABLE crm_v2.company_contacts DISABLE TRIGGER ALL;

  delete from "crm_v2"."company_contacts" where "is_test" = TRUE;

  ALTER TABLE crm_v2.company_contacts ENABLE TRIGGER ALL;
  `)
}

async function _crmV2Companies () {
  return db.raw(`
  ALTER TABLE crm_v2.companies DISABLE TRIGGER ALL;

  delete from "crm_v2"."companies" where "is_test" = TRUE;
  delete from "crm_v2"."companies" where "name" like 'Big Farm Co Ltd%';

  ALTER TABLE crm_v2.companies ENABLE TRIGGER ALL;
  `)
}

async function _crmV2Addresses () {
  return db.raw(`
  ALTER TABLE crm_v2.addresses DISABLE TRIGGER ALL;

  delete from "crm_v2"."addresses" where "is_test" = TRUE;

  ALTER TABLE crm_v2.addresses ENABLE TRIGGER ALL;
  `)
}

async function _crmV2Documents () {
  return db.raw(`
  ALTER TABLE crm_v2.documents DISABLE TRIGGER ALL;

  delete from "crm_v2"."documents" where "is_test" = TRUE;
  delete from "crm_v2"."documents" as "d" using "crm"."document_header" as "dh" where jsonb_path_query_first("dh"."metadata", '$.dataType') #>> '{}' = 'acceptance-test-setup' and "d"."document_ref" = "dh"."system_external_id";

  ALTER TABLE crm_v2.documents ENABLE TRIGGER ALL;
  `)
}

async function _crmV2Contacts () {
  return db.raw(`
  ALTER TABLE crm_v2.contacts DISABLE TRIGGER ALL;

  delete from "crm_v2"."contacts" where "is_test" = TRUE;

  ALTER TABLE crm_v2.contacts ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}

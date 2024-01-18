'use strict'

/**
 * Removes all data created for acceptance tests from the crm schemas
 * @module CrmSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  const startTime = process.hrtime.bigint()

  // await _disableTriggers()

  // await _deleteTestData('crm_v2.documentRoles')
  // await _deleteTestData('crm_v2.companyAddresses')
  // await _deleteEntities()
  // await _deleteInvoiceAccounts()
  // await _deleteTestData('crm_v2.companyContacts')
  // await _deleteTestData('crm_v2.companies')
  // await _deleteTestData('crm_v2.addresses')
  // await _deleteDocuments()
  // await _deleteTestData('crm_v2.contacts')

  // await _deleteCompanies()

  // await _enableTriggers()

  // await _raw()
  await Promise.all([
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

  _calculateAndLogTime(startTime)
}

async function _deleteCompanies () {
  const query = db
    .from('crm_v2.companies')
    .whereLike('name', 'Big Farm Co Ltd%')
    .del()
    .toString()
  console.log('🚀 ~ CRM-COMPANIES:', query)
  await db
    .from('crm_v2.companies')
    .whereLike('name', 'Big Farm Co Ltd%')
    .del()
}

async function _deleteEntities () {
  let query = db
    .from('crm.entityRoles')
    .where('createdBy', 'acceptance-test-setup')
    .del()
    .toString()
  console.log('🚀 ~ CRM-ENTITYROLES:', query)
  await db
    .from('crm.entityRoles')
    .where('createdBy', 'acceptance-test-setup')
    .del()

  query = db
    .from('crm.entity')
    .whereLike('entityNm', 'acceptance-test.%')
    .orWhereLike('entityNm', '%@example.com')
    .orWhereLike('entityNm', 'regression.tests.%')
    .orWhereLike('entityNm', 'Big Farm Co Ltd%')
    .orWhere('source', 'acceptance-test-setup')
    .del()
    .toString()
  console.log('🚀 ~ CRM-ENTITY:', query)
  await db
    .from('crm.entity')
    .whereLike('entityNm', 'acceptance-test.%')
    .orWhereLike('entityNm', '%@example.com')
    .orWhereLike('entityNm', 'regression.tests.%')
    .orWhereLike('entityNm', 'Big Farm Co Ltd%')
    .orWhere('source', 'acceptance-test-setup')
    .del()
}

async function _deleteInvoiceAccounts () {
  let query = db
    .from('crm_v2.invoiceAccountAddresses as iaa')
    .innerJoin('crm_v2.invoiceAccounts as ia', 'iaa.invoiceAccountId', 'ia.invoiceAccountId')
    .innerJoin('crm_v2.companies as c', 'ia.companyId', 'c.companyId')
    .where('c.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ CRM-INVOICEACCOUNTADDRESSES:', query)
  await db
    .from('crm_v2.invoiceAccountAddresses as iaa')
    .innerJoin('crm_v2.invoiceAccounts as ia', 'iaa.invoiceAccountId', 'ia.invoiceAccountId')
    .innerJoin('crm_v2.companies as c', 'ia.companyId', 'c.companyId')
    .where('c.isTest', true)
    .del()

  await _deleteTestData('crm_v2.invoiceAccountAddresses')

  query = db
    .from('crm_v2.invoiceAccounts as ia')
    .innerJoin('crm_v2.companies as c', 'ia.companyId', 'c.companyId')
    .where('c.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ CRM-INVOICEACCOUNTS:', query)
  await db
    .from('crm_v2.invoiceAccounts as ia')
    .innerJoin('crm_v2.companies as c', 'ia.companyId', 'c.companyId')
    .where('c.isTest', true)
    .del()
}

async function _deleteDocuments () {
  await _deleteTestData('crm_v2.documents')

  let query = db
    .from('crm_v2.documents as d')
    .innerJoin('crm.documentHeader as dh', 'd.documentRef', 'dh.systemExternalId')
    .whereJsonPath('dh.metadata', '$.dataType', '=', 'acceptance-test-setup')
    .del()
    .toString()
  console.log('🚀 ~ CRM-DOCUMENTS:', query)
  await db
    .from('crm_v2.documents as d')
    .innerJoin('crm.documentHeader as dh', 'd.documentRef', 'dh.systemExternalId')
    .whereJsonPath('dh.metadata', '$.dataType', '=', 'acceptance-test-setup')
    .del()

  query = db
    .from('crm.documentHeader')
    .whereJsonPath('metadata', '$.dataType', '=', 'acceptance-test-setup')
    .del()
    .toString()
  console.log('🚀 ~ CRM-DOCUMENTHEADER:', query)
  await db
    .from('crm.documentHeader')
    .whereJsonPath('metadata', '$.dataType', '=', 'acceptance-test-setup')
    .del()
}

async function _deleteTestData (tableName) {
  const query = db
    .from(tableName)
    .where('isTest', true)
    .del()
    .toString()
  console.log(`🚀 ~ CRM-${tableName}:`, query)

  await db
    .from(tableName)
    .where('isTest', true)
    .del()
}

async function _disableTriggers () {
  await Promise.all([
    db.raw('ALTER TABLE crm.document_header DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm.entity DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm.entity_roles DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.addresses DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.companies DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.company_addresses DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.company_contacts DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.contacts DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.documents DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.document_roles DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.invoice_accounts DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.invoice_account_addresses DISABLE TRIGGER ALL')
  ])
}

async function _enableTriggers () {
  await Promise.all([
    db.raw('ALTER TABLE crm.document_header ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm.entity ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm.entity_roles ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.addresses ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.companies ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.company_addresses ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.company_contacts ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.contacts ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.documents ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.document_roles ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.invoice_accounts ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE crm_v2.invoice_account_addresses ENABLE TRIGGER ALL')
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

async function _raw () {
  await db.raw(`
  ALTER TABLE crm.document_header DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.addresses DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.companies DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.company_addresses DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.company_contacts DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.contacts DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.documents DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.document_roles DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.invoice_accounts DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.invoice_account_addresses DISABLE TRIGGER ALL;

  delete from "crm_v2"."document_roles" where "is_test" = TRUE;
  delete from "crm_v2"."company_addresses" where "is_test" = TRUE;
  delete from "crm"."entity_roles" where "created_by" = 'acceptance-test-setup';
  delete from "crm"."entity" where "entity_nm" like 'acceptance-test.%' or "entity_nm" like '%@example.com' or "entity_nm" like 'regression.tests.%' or "entity_nm" like 'Big Farm Co Ltd%' or "source" = 'acceptance-test-setup';
  delete from "crm_v2"."invoice_account_addresses" as "iaa" using "crm_v2"."invoice_accounts" as "ia","crm_v2"."companies" as "c" where "c"."is_test" = true and "iaa"."invoice_account_id" = "ia"."invoice_account_id" and "ia"."company_id" = "c"."company_id";
  delete from "crm_v2"."invoice_account_addresses" where "is_test" = TRUE;
  delete from "crm_v2"."invoice_accounts" as "ia" using "crm_v2"."companies" as "c" where "c"."is_test" = true and "ia"."company_id" = "c"."company_id";
  delete from "crm_v2"."company_contacts" where "is_test" = TRUE;
  delete from "crm_v2"."companies" where "is_test" = TRUE;
  delete from "crm_v2"."addresses" where "is_test" = TRUE;
  delete from "crm_v2"."documents" where "is_test" = TRUE;
  delete from "crm_v2"."documents" as "d" using "crm"."document_header" as "dh" where jsonb_path_query_first("dh"."metadata", '$.dataType') #>> '{}' = 'acceptance-test-setup' and "d"."document_ref" = "dh"."system_external_id";
  delete from "crm"."document_header" where jsonb_path_query_first("metadata", '$.dataType') #>> '{}' = 'acceptance-test-setup';
  delete from "crm_v2"."contacts" where "is_test" = TRUE;
  delete from "crm_v2"."companies" where "name" like 'Big Farm Co Ltd%';

  ALTER TABLE crm.document_header ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.addresses ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.companies ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.company_addresses ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.company_contacts ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.contacts ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.documents ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.document_roles ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.invoice_accounts ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.invoice_account_addresses ENABLE TRIGGER ALL;
  `)
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('CRM complete', { timeTakenMs })
}

module.exports = {
  go
}

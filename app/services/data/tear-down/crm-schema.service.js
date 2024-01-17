'use strict'

/**
 * Removes all data created for acceptance tests from the crm schemas
 * @module CrmSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  const startTime = process.hrtime.bigint()

  await _disableTriggers()

  await _deleteTestData('crm_v2.documentRoles')
  await _deleteTestData('crm_v2.companyAddresses')
  await _deleteEntities()
  await _deleteInvoiceAccounts()
  await _deleteTestData('crm_v2.companyContacts')
  await _deleteTestData('crm_v2.companies')
  await _deleteTestData('crm_v2.addresses')
  await _deleteDocuments()
  await _deleteTestData('crm_v2.contacts')

  await _deleteCompanies()

  await _enableTriggers()

  _calculateAndLogTime(startTime)
}

async function _deleteCompanies () {
  await db
    .from('crm_v2.companies')
    .whereLike('name', 'Big Farm Co Ltd%')
    .del()
}

async function _deleteEntities () {
  await db
    .from('crm.entityRoles')
    .where('createdBy', 'acceptance-test-setup')
    .del()

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
  await db
    .from('crm_v2.invoiceAccountAddresses as iaa')
    .innerJoin('crm_v2.invoiceAccounts as ia', 'iaa.invoiceAccountId', 'ia.invoiceAccountId')
    .innerJoin('crm_v2.companies as c', 'ia.companyId', 'c.companyId')
    .where('c.isTest', true)
    .del()

  await _deleteTestData('crm_v2.invoiceAccountAddresses')

  await db
    .from('crm_v2.invoiceAccounts as ia')
    .innerJoin('crm_v2.companies as c', 'ia.companyId', 'c.companyId')
    .where('c.isTest', true)
    .del()
}

async function _deleteDocuments () {
  await _deleteTestData('crm_v2.documents')

  await db
    .from('crm_v2.documents as d')
    .innerJoin('crm.documentHeader as dh', 'd.documentRef', 'dh.systemExternalId')
    .whereJsonPath('dh.metadata', '$.dataType', '=', 'acceptance-test-setup')
    .del()

  await db
    .from('crm.documentHeader')
    .whereJsonPath('metadata', '$.dataType', '=', 'acceptance-test-setup')
    .del()
}

async function _deleteTestData (tableName) {
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

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('CRM complete', { timeTakenMs })
}

module.exports = {
  go
}

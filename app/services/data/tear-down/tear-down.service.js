'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const { db } = require('../../../../db/db.js')
const TearDownWaterSchemaService = require('./tear-down-water-schema.service.js')

async function go () {
  await TearDownWaterSchemaService.go()

  // crm schemas
  await _deleteTestData('crm_v2.documentRoles')
  await _deleteTestData('crm_v2.companyAddresses')
  await _deleteEntities()
  await _deleteInvoiceAccounts()
  await _deleteTestData('crm_v2.companyContacts')
  await _deleteTestData('crm_v2.companies')
  await _deleteTestData('crm_v2.addresses')
  await _deleteDocuments()
  await _deleteTestData('crm_v2.contacts')

  // returns schema
  await _deleteReturns()

  // permit schema
  await _deletePermit()

  // idm schema
  await _deleteUsers()

  return 'Test data deleted!'
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
    .where(db.raw("dh.metadata->>'dataType' = 'acceptance-test-setup'"))
    .del()

  await db
    .from('crm.documentHeader')
    .where(db.raw("metadata->>'dataType' = 'acceptance-test-setup'"))
    .del()
}

async function _deleteReturns () {
  await db
    .from('returns.lines as l')
    .innerJoin('returns.versions as v', 'l.versionId', 'v.versionId')
    .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
    .where('r.isTest', true)
    .del()

  await db
    .from('returns.versions as v')
    .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
    .where('r.isTest', true)
    .del()

  await _deleteTestData('returns.returns')
}

async function _deletePermit () {
  await db
    .from('permit.licence')
    .where(db.raw("metadata->>'source' = 'acceptance-test-setup'"))
    .del()
}

async function _deleteUsers () {
  await db
    .from('idm.users')
    .where(db.raw("user_data->>'source' = 'acceptance-test-setup'"))
    .orWhereLike('userName', '%@example.com')
    .del()
}

async function _deleteTestData (tableName) {
  await db
    .from(tableName)
    .where('isTest', true)
    .del()
}

module.exports = {
  go
}

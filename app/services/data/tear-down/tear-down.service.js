'use strict'

/**
 * Does stuff
 * @module TearDownService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  // billing data
  await _deleteBilling()
  await _deleteGaugingStations()
  await _deleteTestData('water.chargeElements')
  await _deleteChargeVersions()
  await _deleteTestData('water.licenceAgreements')
  await _deleteReturnRequirements()
  await _deleteLicenceAgreements()
  await _deleteTestData('water.financialAgreementTypes')
  await _deleteTestData('water.licenceVersionPurposes')
  await _deleteTestData('water.licenceVersions')
  await _deleteTestData('water.licences')
  await _deleteTestData('water.regions')

  // crm schemas
  await _deleteTestData('crm_v2.documentRoles')
  await _deleteTestData('crm_v2.companyAddresses')
  await _deleteEntity()
  await _deleteInvoiceAccounts()
  await _deleteTestData('crm_v2.companyContacts')
  await _deleteTestData('crm_v2.companies')
  await _deleteTestData('crm_v2.addresses')
  await _deleteTestData('crm_v2.documents')
  await _deleteTestData('crm_v2.contacts')

  // returns schema
  await _deleteReturns()

  // purposes data
  await _deleteTestData('water.purposesPrimary')
  await _deleteTestData('water.purposesSecondary')
  await _deleteTestData('water.purposesUses')

  return 'Data deleted'
}

async function _deleteBilling () {
  // Delete billingtransactions
  const billingInvoiceLicences = await db
    .from('water.billingTransactions as bt')
    .innerJoin('water.billingInvoiceLicences as bil', 'bt.billingInvoiceLicenceId', 'bil.billingInvoiceLicenceId')
    .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
    .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    .where('r.isTest', true)
    .del(['bt.billingInvoiceLicenceId'])

  const billingInvoiceLicenceIds = billingInvoiceLicences.map((billingInvoiceLicence) => {
    return billingInvoiceLicence.billingInvoiceLicenceId
  })

  // Delete billingInvoiceLicences
  const billingInvoices = await db
    .from('water.billingInvoiceLicences')
    .whereIn('billingInvoiceLicenceId', billingInvoiceLicenceIds)
    .del(['billingInvoiceId'])

  const billingInvoiceIds = billingInvoices.map((billingInvoice) => {
    return billingInvoice.billingInvoiceId
  })

  // Delete billingInvoices
  const billingBatches = await db
    .from('water.billingInvoices')
    .whereIn('billingInvoiceId', billingInvoiceIds)
    .del(['billingBatchId'])

  const billingBatchIds = billingBatches.map((billingBatch) => {
    return billingBatch.billingBatchId
  })

  // Delete billingBatchChargeVersionYears
  await db
    .from('water.billingBatchChargeVersionYears')
    .whereIn('billingBatchId', billingBatchIds)
    .del()

  // Delete billingVolumes
  await db
    .from('water.billingVolumes')
    .whereIn('billingBatchId', billingBatchIds)
    .del()

  // Delete billingBatches
  await db
    .from('water.billingBatches')
    .whereIn('billingBatchId', billingBatchIds)
    .del()
}

async function _deleteGaugingStations () {
  // Delete licenceGaugingStations
  await db
    .from('water.licenceGaugingStations as lgs')
    .innerJoin('water.gaugingStations as gs', 'lgs.gaugingStationId', 'gs.gaugingStationId')
    .where('gs.isTest', true)
    .del()

  // Delete gaugingStations
  await _deleteTestData('water.gaugingStations')
}

async function _deleteChargeVersions () {
  // Delete chargeVersionWorkflows
  await db
    .from('water.chargeVersionWorkflows')
    .del()

  // Delete chargeElements
  await db
    .from('water.chargeElements as ce')
    .innerJoin('water.chargeVersions as cv', 'ce.chargeVersionId', 'cv.chargeVersionId')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  // Delete chargeversions
  await db
    .from('water.chargeVersions as cv')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
}

async function _deleteReturnRequirements () {
  // Delete returnRequirementPurposes
  await db
    .from('water.returnRequirementPurposes as rrp')
    .innerJoin('water.returnRequirements as rr', 'rrp.returnRequirementId', 'rr.returnRequirementId')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  // Delete returnRequirements
  await db
    .from('water.returnRequirements as rr')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  // Delete returnVersions
  await db
    .from('water.returnVersions as rv')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
}

async function _deleteLicenceAgreements () {
  await db
    .from('water.licenceAgreements as la')
    .innerJoin('water.licences as l', 'la.licenceRef', 'l.licenceRef')
    .where('l.isTest', true)
    .del()

  await _deleteTestData('water.licenceAgreements')
}

async function _deleteEntity () {
  await db
    .from('crm.entity')
    .whereLike('entityNm', 'acceptance-test.%')
    .orWhereLike('entityNm', '%@example.com')
    .orWhereLike('entityNm', 'regression.tests.%')
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

async function _deleteTestData (tableName) {
  await db
    .from(tableName)
    .where('isTest', true)
    .del()
}

module.exports = {
  go
}

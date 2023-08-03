'use strict'

/**
 * Removes all data created for acceptance tests from the water schema
 * @module WaterSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
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
  await _deleteTestData('water.purposesPrimary')
  await _deleteTestData('water.purposesSecondary')
  await _deleteTestData('water.purposesUses')
  await _deleteNotifications()
  await _deleteSessions()
}

async function _deleteBilling () {
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

  const billingInvoices = await db
    .from('water.billingInvoiceLicences')
    .whereIn('billingInvoiceLicenceId', billingInvoiceLicenceIds)
    .del(['billingInvoiceId'])

  const billingInvoiceIds = billingInvoices.map((billingInvoice) => {
    return billingInvoice.billingInvoiceId
  })

  const billingBatches = await db
    .from('water.billingInvoices')
    .whereIn('billingInvoiceId', billingInvoiceIds)
    .del(['billingBatchId'])

  const billingBatchIds = billingBatches.map((billingBatch) => {
    return billingBatch.billingBatchId
  })

  await db
    .from('water.billingBatchChargeVersionYears')
    .whereIn('billingBatchId', billingBatchIds)
    .del()

  await db
    .from('water.billingVolumes')
    .whereIn('billingBatchId', billingBatchIds)
    .del()

  // Just deleting the `billingBatches` based on the `billingBatchIds` does not always remove all test records so the
  // Test Region is used to identify the records for deletion
  await db
    .from('water.billingBatches as bb')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    .where('r.isTest', true)
    .del()
}

async function _deleteGaugingStations () {
  await db
    .from('water.licenceGaugingStations as lgs')
    .innerJoin('water.gaugingStations as gs', 'lgs.gaugingStationId', 'gs.gaugingStationId')
    .where('gs.isTest', true)
    .del()

  await _deleteTestData('water.gaugingStations')
}

async function _deleteChargeVersions () {
  await db
    .from('water.chargeVersionWorkflows')
    .del()

  await db
    .from('water.chargeElements as ce')
    .innerJoin('water.chargeVersions as cv', 'ce.chargeVersionId', 'cv.chargeVersionId')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  await db
    .from('water.chargeVersions as cv')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
}

async function _deleteReturnRequirements () {
  await db
    .from('water.returnRequirementPurposes as rrp')
    .innerJoin('water.returnRequirements as rr', 'rrp.returnRequirementId', 'rr.returnRequirementId')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  await db
    .from('water.returnRequirements as rr')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

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

async function _deleteNotifications () {
  await db
    .from('water.scheduledNotification')
    .where('messageRef', 'test-ref')
    .del()

  await db
    .from('water.scheduledNotification as sn')
    .innerJoin('water.events as e', 'sn.eventId', 'e.eventId')
    .whereLike('e.issuer', 'acceptance-test%')
    .del()

  await db
    .from('water.events')
    .whereLike('issuer', 'acceptance-test%')
    .del()
}

async function _deleteSessions () {
  await db
    .from('water.sessions')
    // NOTE: Normally we would use whereJsonPath() when working with JSONB fields in PostgreSQL. However, the previous
    // team opted to create 'session_data' as a varchar field and dump JSON into it. So, we are unable to in this case.
    .where(db.raw("session_data::jsonb->>'companyName' = 'acceptance-test-company'"))
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

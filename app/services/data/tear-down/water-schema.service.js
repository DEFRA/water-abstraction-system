'use strict'

/**
 * Removes all data created for acceptance tests from the water schema
 * @module WaterSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  const startTime = process.hrtime.bigint()

  await _disableTriggers()

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

  await _enableTriggers()

  _calculateAndLogTime(startTime)
}

async function _deleteBilling () {
  const billLicences = await db
    .from('water.billingTransactions as bt')
    .innerJoin('water.billingInvoiceLicences as bil', 'bt.billingInvoiceLicenceId', 'bil.billingInvoiceLicenceId')
    .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
    .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    .where('r.isTest', true)
    .del(['bt.billingInvoiceLicenceId'])

  const billLicenceIds = billLicences.map((billLicence) => {
    return billLicence.billingInvoiceLicenceId
  })

  const bills = await db
    .from('water.billingInvoiceLicences')
    .whereIn('billingInvoiceLicenceId', billLicenceIds)
    .del(['billingInvoiceId'])

  const billIds = bills.map((bill) => {
    return bill.billingInvoiceId
  })

  const billRuns = await db
    .from('water.billingInvoices')
    .whereIn('billingInvoiceId', billIds)
    .del(['billingBatchId'])

  const billRunIds = billRuns.map((billRun) => {
    return billRun.billingBatchId
  })

  await db
    .from('water.billingBatchChargeVersionYears')
    .whereIn('billingBatchId', billRunIds)
    .del()

  await db
    .from('water.billingVolumes')
    .whereIn('billingBatchId', billRunIds)
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

async function _disableTriggers () {
  await Promise.all([
    db.raw('ALTER TABLE water.billing_batch_charge_version_years DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_batches DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_invoices DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_invoice_licences DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_transactions DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_volumes DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.events DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.charge_elements DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.charge_versions DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.charge_version_workflows DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.licence_agreements DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.gauging_stations DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.return_requirement_purposes DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.return_requirements DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.return_versions DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.scheduled_notification DISABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.sessions DISABLE TRIGGER ALL')
  ])
}

async function _enableTriggers () {
  await Promise.all([
    db.raw('ALTER TABLE water.billing_batch_charge_version_years ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_batches ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_invoices ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_invoice_licences ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_transactions ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.billing_volumes ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.events ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.charge_elements ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.charge_versions ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.charge_version_workflows ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.licence_agreements ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.gauging_stations ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.return_requirement_purposes ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.return_requirements ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.return_versions ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.scheduled_notification ENABLE TRIGGER ALL'),
    db.raw('ALTER TABLE water.sessions enable TRIGGER ALL')
  ])
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Water complete', { timeTakenMs })
}

module.exports = {
  go
}

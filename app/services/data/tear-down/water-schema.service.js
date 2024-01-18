'use strict'

/**
 * Removes all data created for acceptance tests from the water schema
 * @module WaterSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  const startTime = process.hrtime.bigint()

  // await _disableTriggers()

  // await _deleteBilling()
  // await _deleteGaugingStations()
  // await _deleteTestData('water.chargeElements')
  // await _deleteChargeVersions()
  // await _deleteTestData('water.licenceAgreements')
  // await _deleteReturnRequirements()
  // await _deleteLicenceAgreements()
  // await _deleteTestData('water.financialAgreementTypes')
  // await _deleteTestData('water.licenceVersionPurposes')
  // await _deleteTestData('water.licenceVersions')
  // await _deleteTestData('water.licences')
  // await _deleteTestData('water.regions')
  // await _deleteTestData('water.purposesPrimary')
  // await _deleteTestData('water.purposesSecondary')
  // await _deleteTestData('water.purposesUses')
  // await _deleteNotifications()
  // await _deleteSessions()

  // await _enableTriggers()

  // await _raw()

  await Promise.all([
    _billingTransactions(),
    _billingInvoiceLicences(),
    _billingInvoices(),
    _billingChargeVersionYears(),
    _billingVolumes(),
    _billingBatches(),
    _gaugingStations(),
    _chargeElements(),
    _chargeVersionWorkflows(),
    _chargeVersions(),
    _licenceAgreements(),
    _returnRequirementPurposes(),
    _returnRequirements(),
    _returnVersions(),
    _financialAgreementTypes(),
    _licenceVersionPurposes(),
    _licenceVersions(),
    _licences(),
    _purposesPrimary,
    _purposesSecondary(),
    _purposesUses(),
    _scheduledNotification(),
    _events(),
    _sessions()
  ])

  await _regions()

  _calculateAndLogTime(startTime)
}

async function _deleteBilling () {
  let query = db
    .from('water.billingTransactions as bt')
    .innerJoin('water.billingInvoiceLicences as bil', 'bt.billingInvoiceLicenceId', 'bil.billingInvoiceLicenceId')
    .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
    .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    .where('r.isTest', true)
    .del(['bt.billingInvoiceLicenceId'])
    .toString()
  console.log('🚀 ~ WATER-BILLING_TRANSACTIONS:', query)
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

  query = db
    .from('water.billingInvoiceLicences')
    .whereIn('billingInvoiceLicenceId', billLicenceIds)
    .del(['billingInvoiceId'])
    .toString()
  console.log('🚀 ~ WATER-BILLING_INVOICE_LICENCES:', query)
  const bills = await db
    .from('water.billingInvoiceLicences')
    .whereIn('billingInvoiceLicenceId', billLicenceIds)
    .del(['billingInvoiceId'])

  const billIds = bills.map((bill) => {
    return bill.billingInvoiceId
  })

  query = db
    .from('water.billingInvoices')
    .whereIn('billingInvoiceId', billIds)
    .del(['billingBatchId'])
    .toString()
  console.log('🚀 ~ WATER-BILLING_INVOICES:', query)
  const billRuns = await db
    .from('water.billingInvoices')
    .whereIn('billingInvoiceId', billIds)
    .del(['billingBatchId'])

  const billRunIds = billRuns.map((billRun) => {
    return billRun.billingBatchId
  })

  query = db
    .from('water.billingBatchChargeVersionYears')
    .whereIn('billingBatchId', billRunIds)
    .del()
    .toString()
  console.log('🚀 ~ WATER-BILLING_CHARGE_VERSION_YEARS:', query)
  await db
    .from('water.billingBatchChargeVersionYears')
    .whereIn('billingBatchId', billRunIds)
    .del()

  query = db
    .from('water.billingVolumes')
    .whereIn('billingBatchId', billRunIds)
    .del()
    .toString()
  console.log('🚀 ~ WATER-BILLING_VOLUMES:', query)
  await db
    .from('water.billingVolumes')
    .whereIn('billingBatchId', billRunIds)
    .del()

  // Just deleting the `billingBatches` based on the `billingBatchIds` does not always remove all test records so the
  // Test Region is used to identify the records for deletion
  query = db
    .from('water.billingBatches as bb')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    .where('r.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ WATER-BILLING_BATCHES:', query)
  await db
    .from('water.billingBatches as bb')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    .where('r.isTest', true)
    .del()
}

async function _deleteGaugingStations () {
  const query = db
    .from('water.licenceGaugingStations as lgs')
    .innerJoin('water.gaugingStations as gs', 'lgs.gaugingStationId', 'gs.gaugingStationId')
    .where('gs.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ WATER-LICENCE_GAUGING_STATIONS:', query)
  await db
    .from('water.licenceGaugingStations as lgs')
    .innerJoin('water.gaugingStations as gs', 'lgs.gaugingStationId', 'gs.gaugingStationId')
    .where('gs.isTest', true)
    .del()

  await _deleteTestData('water.gaugingStations')
}

async function _deleteChargeVersions () {
  let query = db
    .from('water.chargeVersionWorkflows')
    .del()
    .toString()
  console.log('🚀 ~ WATER-CHG_VER_WORKFLOWS:', query)
  await db
    .from('water.chargeVersionWorkflows')
    .del()

  query = db
    .from('water.chargeElements as ce')
    .innerJoin('water.chargeVersions as cv', 'ce.chargeVersionId', 'cv.chargeVersionId')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ WATER-CHG_ELEMENTS:', query)
  await db
    .from('water.chargeElements as ce')
    .innerJoin('water.chargeVersions as cv', 'ce.chargeVersionId', 'cv.chargeVersionId')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  query = db
    .from('water.chargeVersions as cv')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ WATER-CHG_VERSIONS:', query)
  await db
    .from('water.chargeVersions as cv')
    .innerJoin('water.licences as l', 'cv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
}

async function _deleteReturnRequirements () {
  let query = db
    .from('water.returnRequirementPurposes as rrp')
    .innerJoin('water.returnRequirements as rr', 'rrp.returnRequirementId', 'rr.returnRequirementId')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ WATER-RTN_REQ_PURPOSES:', query)
  await db
    .from('water.returnRequirementPurposes as rrp')
    .innerJoin('water.returnRequirements as rr', 'rrp.returnRequirementId', 'rr.returnRequirementId')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  query = db
    .from('water.returnRequirements as rr')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ WATER-RET_REQUIREMENTS:', query)
  await db
    .from('water.returnRequirements as rr')
    .innerJoin('water.returnVersions as rv', 'rr.returnVersionId', 'rv.returnVersionId')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()

  query = db
    .from('water.returnVersions as rv')
    .innerJoin('water.licences as l', 'rv.licenceId', 'l.licenceId')
    .where('l.isTest', true)
    .del()
    .toString()
  console.log('🚀 ~ WATER-RET_VERSIONS:', query)
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
  let query = db
    .from('water.scheduledNotification')
    .where('messageRef', 'test-ref')
    .del()
    .toString()
  console.log('🚀 ~ WATER-SCHEDULEDNOTIFICATIONS-1:', query)
  await db
    .from('water.scheduledNotification')
    .where('messageRef', 'test-ref')
    .del()

  query = db
    .from('water.scheduledNotification as sn')
    .innerJoin('water.events as e', 'sn.eventId', 'e.eventId')
    .whereLike('e.issuer', 'acceptance-test%')
    .del()
    .toString()
  console.log('🚀 ~ WATER-SCHEDULEDNOTIFICATIONS-2:', query)
  await db
    .from('water.scheduledNotification as sn')
    .innerJoin('water.events as e', 'sn.eventId', 'e.eventId')
    .whereLike('e.issuer', 'acceptance-test%')
    .del()

  query = db
    .from('water.events')
    .whereLike('issuer', 'acceptance-test%')
    .del()
    .toString()
  console.log('🚀 ~ WATER-EVENTS:', query)
  await db
    .from('water.events')
    .whereLike('issuer', 'acceptance-test%')
    .del()
}

async function _deleteSessions () {
  const query = db
    .from('water.sessions')
    .where(db.raw("session_data::jsonb->>'companyName' = 'acceptance-test-company'"))
    .del()
    .toString()
  console.log('🚀 ~ WATER-SESSIONS:', query)
  await db
    .from('water.sessions')
    // NOTE: Normally we would use whereJsonPath() when working with JSONB fields in PostgreSQL. However, the previous
    // team opted to create 'session_data' as a varchar field and dump JSON into it. So, we are unable to in this case.
    .where(db.raw("session_data::jsonb->>'companyName' = 'acceptance-test-company'"))
    .del()
}

async function _deleteTestData (tableName) {
  const query = db
    .from(tableName)
    .where('isTest', true)
    .del()
    .toString()
  console.log(`🚀 ~ WATER-${tableName}:`, query)

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

async function _billingTransactions () {
  return db.raw(`
  ALTER TABLE water.billing_transactions DISABLE TRIGGER ALL;

  delete from "water"."billing_transactions" as "bt"
using "water"."billing_invoice_licences" as "bil", "water"."billing_invoices" as "bi", "water"."billing_batches" as "bb", "water"."regions" as "r"
where "r"."is_test" = true and "bt"."billing_invoice_licence_id" = "bil"."billing_invoice_licence_id" and "bil"."billing_invoice_id" = "bi"."billing_invoice_id" and "bi"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_transactions ENABLE TRIGGER ALL;
  `)
}

async function _billingInvoiceLicences () {
  return db.raw(`
  ALTER TABLE water.billing_invoice_licences DISABLE TRIGGER ALL;

  delete from "water"."billing_invoice_licences" as "bil"
using "water"."billing_invoices" as "bi", "water"."billing_batches" as "bb", "water"."regions" as "r"
where "r"."is_test" = true and "bil"."billing_invoice_id" = "bi"."billing_invoice_id" and "bi"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_invoice_licences ENABLE TRIGGER ALL;
  `)
}

async function _billingInvoices () {
  return db.raw(`
  ALTER TABLE water.billing_invoices DISABLE TRIGGER ALL;

  delete from "water"."billing_invoices" as "bi"
using "water"."billing_batches" as "bb", "water"."regions" as "r"
where "r"."is_test" = true and "bi"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_invoices ENABLE TRIGGER ALL;
  `)
}

async function _billingChargeVersionYears () {
  return db.raw(`
  ALTER TABLE water.billing_batch_charge_version_years DISABLE TRIGGER ALL;

  delete from "water"."billing_batch_charge_version_years" as "bbcvy"
using "water"."billing_batches" as "bb", "water"."regions" as "r"
where "r"."is_test" = true and "bbcvy"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_batch_charge_version_years ENABLE TRIGGER ALL;
  `)
}

async function _billingVolumes () {
  return db.raw(`
  ALTER TABLE water.billing_volumes DISABLE TRIGGER ALL;

  delete from "water"."billing_volumes" as "bv"
using "water"."billing_batches" as "bb", "water"."regions" as "r"
where "r"."is_test" = true and "bv"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_volumes ENABLE TRIGGER ALL;
  `)
}

async function _billingBatches () {
  return db.raw(`
  ALTER TABLE water.billing_batches DISABLE TRIGGER ALL;

  delete from "water"."billing_batches" as "bb" using "water"."regions" as "r" where "r"."is_test" = true and "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_batches ENABLE TRIGGER ALL;
  `)
}

async function _gaugingStations () {
  return db.raw(`
  delete from "water"."licence_gauging_stations" as "lgs" using "water"."gauging_stations" as "gs" where "gs"."is_test" = true and "lgs"."gauging_station_id" = "gs"."gauging_station_id";
  delete from "water"."gauging_stations" where "is_test" = TRUE;
  `)
}

async function _chargeElements () {
  return db.raw(`
  ALTER TABLE water.charge_elements DISABLE TRIGGER ALL;

  delete from "water"."charge_elements" where "is_test" = TRUE;
  delete from "water"."charge_elements" as "ce" using "water"."charge_versions" as "cv","water"."licences" as "l" where "l"."is_test" = true and "ce"."charge_version_id" = "cv"."charge_version_id" and "cv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.charge_elements ENABLE TRIGGER ALL;
  `)
}

async function _chargeVersionWorkflows () {
  return db.raw(`
  ALTER TABLE water.charge_version_workflows DISABLE TRIGGER ALL;

  TRUNCATE "water"."charge_version_workflows";

  ALTER TABLE water.charge_version_workflows ENABLE TRIGGER ALL;
  `)
}

async function _chargeVersions () {
  return db.raw(`
  ALTER TABLE water.charge_versions DISABLE TRIGGER ALL;

  delete from "water"."charge_versions" as "cv" using "water"."licences" as "l" where "l"."is_test" = true and "cv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.charge_versions ENABLE TRIGGER ALL;
  `)
}

async function _licenceAgreements () {
  return db.raw(`
  ALTER TABLE water.licence_agreements DISABLE TRIGGER ALL;

  delete from "water"."licence_agreements" where "is_test" = TRUE;

  ALTER TABLE water.licence_agreements ENABLE TRIGGER ALL;
  `)
}

async function _returnRequirementPurposes () {
  return db.raw(`
  ALTER TABLE water.return_requirement_purposes DISABLE TRIGGER ALL;

  delete from "water"."return_requirement_purposes" as "rrp" using "water"."return_requirements" as "rr","water"."return_versions" as "rv","water"."licences" as "l" where "l"."is_test" = true and "rrp"."return_requirement_id" = "rr"."return_requirement_id" and "rr"."return_version_id" = "rv"."return_version_id" and "rv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.return_requirement_purposes ENABLE TRIGGER ALL;
  `)
}

async function _returnRequirements () {
  return db.raw(`
  ALTER TABLE water.return_requirements DISABLE TRIGGER ALL;

  delete from "water"."return_requirements" as "rr" using "water"."return_versions" as "rv","water"."licences" as "l" where "l"."is_test" = true and "rr"."return_version_id" = "rv"."return_version_id" and "rv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.return_requirements ENABLE TRIGGER ALL;
  `)
}

async function _returnVersions () {
  return db.raw(`
  ALTER TABLE water.return_versions DISABLE TRIGGER ALL;

  delete from "water"."return_versions" as "rv" using "water"."licences" as "l" where "l"."is_test" = true and "rv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.return_versions ENABLE TRIGGER ALL;
  `)
}

async function _financialAgreementTypes () {
  return db.raw(`
  delete from "water"."financial_agreement_types" where "is_test" = TRUE;
  `)
}

async function _licenceVersionPurposes () {
  return db.raw(`
  ALTER TABLE water.licence_version_purposes DISABLE TRIGGER ALL;

  delete from "water"."licence_version_purposes" where "is_test" = TRUE;

  ALTER TABLE water.licence_version_purposes ENABLE TRIGGER ALL;
  `)
}

async function _licenceVersions () {
  return db.raw(`
  ALTER TABLE water.licence_versions DISABLE TRIGGER ALL;

  delete from "water"."licence_versions" where "is_test" = TRUE;

  ALTER TABLE water.licence_versions ENABLE TRIGGER ALL;
  `)
}

async function _licences () {
  return db.raw(`
  ALTER TABLE water.licences DISABLE TRIGGER ALL;

  delete from "water"."licences" where "is_test" = TRUE;

  ALTER TABLE water.licences ENABLE TRIGGER ALL;
  `)
}

async function _regions () {
  return db.raw(`
  delete from "water"."regions" where "is_test" = TRUE;
  `)
}

async function _purposesPrimary () {
  return db.raw(`
  delete from "water"."purposes_primary" where "is_test" = TRUE;
  `)
}

async function _purposesSecondary () {
  return db.raw(`
  delete from "water"."purposes_secondary" where "is_test" = TRUE;
  `)
}

async function _purposesUses () {
  return db.raw(`
  delete from "water"."purposes_uses" where "is_test" = TRUE;
  `)
}

async function _scheduledNotification () {
  return db.raw(`
  ALTER TABLE water.scheduled_notification DISABLE TRIGGER ALL;

  delete from "water"."scheduled_notification" where "message_ref" = 'test-ref';
  delete from "water"."scheduled_notification" as "sn" using "water"."events" as "e" where "e"."issuer" like 'acceptance-test%' and "sn"."event_id" = "e"."event_id";

  ALTER TABLE water.scheduled_notification ENABLE TRIGGER ALL;
  `)
}

async function _events () {
  return db.raw(`
  delete from "water"."events" where "issuer" like 'acceptance-test%';
  `)
}

async function _sessions () {
  return db.raw(`
  delete from "water"."sessions" where session_data::jsonb->>'companyName' = 'acceptance-test-company';
  `)
}

async function _raw () {
  await db.raw(`
  ALTER TABLE water.billing_batch_charge_version_years DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_batches DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoices DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoice_licences DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_transactions DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_volumes DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_elements DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_versions DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_version_workflows DISABLE TRIGGER ALL;
  ALTER TABLE water.licences DISABLE TRIGGER ALL;
  ALTER TABLE water.licence_agreements DISABLE TRIGGER ALL;
  ALTER TABLE water.licence_versions DISABLE TRIGGER ALL;
  ALTER TABLE water.licence_version_purposes DISABLE TRIGGER ALL;
  ALTER TABLE water.return_requirement_purposes DISABLE TRIGGER ALL;
  ALTER TABLE water.return_requirements DISABLE TRIGGER ALL;
  ALTER TABLE water.return_versions DISABLE TRIGGER ALL;
  ALTER TABLE water.scheduled_notification DISABLE TRIGGER ALL;

  delete from "water"."billing_transactions" as "bt"
  using "water"."billing_invoice_licences" as "bil", "water"."billing_invoices" as "bi", "water"."billing_batches" as "bb", "water"."regions" as "r"
  where "r"."is_test" = true and "bt"."billing_invoice_licence_id" = "bil"."billing_invoice_licence_id" and "bil"."billing_invoice_id" = "bi"."billing_invoice_id" and "bi"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  delete from "water"."billing_invoice_licences" as "bil"
  using "water"."billing_invoices" as "bi", "water"."billing_batches" as "bb", "water"."regions" as "r"
  where "r"."is_test" = true and "bil"."billing_invoice_id" = "bi"."billing_invoice_id" and "bi"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  delete from "water"."billing_invoices" as "bi"
  using "water"."billing_batches" as "bb", "water"."regions" as "r"
  where "r"."is_test" = true and "bi"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  delete from "water"."billing_batch_charge_version_years" as "bbcvy"
  using "water"."billing_batches" as "bb", "water"."regions" as "r"
  where "r"."is_test" = true and "bbcvy"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  delete from "water"."billing_volumes" as "bv"
  using "water"."billing_batches" as "bb", "water"."regions" as "r"
  where "r"."is_test" = true and "bv"."billing_batch_id" = "bb"."billing_batch_id" and "bb"."region_id" = "r"."region_id";

  delete from "water"."billing_batches" as "bb" using "water"."regions" as "r" where "r"."is_test" = true and "bb"."region_id" = "r"."region_id";
  delete from "water"."licence_gauging_stations" as "lgs" using "water"."gauging_stations" as "gs" where "gs"."is_test" = true and "lgs"."gauging_station_id" = "gs"."gauging_station_id";
  delete from "water"."gauging_stations" where "is_test" = TRUE;
  delete from "water"."charge_elements" where "is_test" = TRUE;
  delete from "water"."charge_version_workflows";
  delete from "water"."charge_elements" as "ce" using "water"."charge_versions" as "cv","water"."licences" as "l" where "l"."is_test" = true and "ce"."charge_version_id" = "cv"."charge_version_id" and "cv"."licence_id" = "l"."licence_id";
  delete from "water"."charge_versions" as "cv" using "water"."licences" as "l" where "l"."is_test" = true and "cv"."licence_id" = "l"."licence_id";
  delete from "water"."return_requirement_purposes" as "rrp" using "water"."return_requirements" as "rr","water"."return_versions" as "rv","water"."licences" as "l" where "l"."is_test" = true and "rrp"."return_requirement_id" = "rr"."return_requirement_id" and "rr"."return_version_id" = "rv"."return_version_id" and "rv"."licence_id" = "l"."licence_id";
  delete from "water"."return_requirements" as "rr" using "water"."return_versions" as "rv","water"."licences" as "l" where "l"."is_test" = true and "rr"."return_version_id" = "rv"."return_version_id" and "rv"."licence_id" = "l"."licence_id";
  delete from "water"."return_versions" as "rv" using "water"."licences" as "l" where "l"."is_test" = true and "rv"."licence_id" = "l"."licence_id";
  delete from "water"."licence_agreements" where "is_test" = TRUE;
  delete from "water"."financial_agreement_types" where "is_test" = TRUE;
  delete from "water"."licence_version_purposes" where "is_test" = TRUE;
  delete from "water"."licence_versions" where "is_test" = TRUE;
  delete from "water"."licences" where "is_test" = TRUE;
  delete from "water"."regions" where "is_test" = TRUE;
  delete from "water"."purposes_primary" where "is_test" = TRUE;
  delete from "water"."purposes_secondary" where "is_test" = TRUE;
  delete from "water"."purposes_uses" where "is_test" = TRUE;
  delete from "water"."scheduled_notification" where "message_ref" = 'test-ref';
  delete from "water"."scheduled_notification" as "sn" using "water"."events" as "e" where "e"."issuer" like 'acceptance-test%' and "sn"."event_id" = "e"."event_id";
  delete from "water"."events" where "issuer" like 'acceptance-test%';
  delete from "water"."sessions" where session_data::jsonb->>'companyName' = 'acceptance-test-company';

  ALTER TABLE water.billing_batch_charge_version_years ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_batches ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoices ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoice_licences ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_transactions ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_volumes ENABLE TRIGGER ALL;
  ALTER TABLE water.charge_elements ENABLE TRIGGER ALL;
  ALTER TABLE water.charge_versions ENABLE TRIGGER ALL;
  ALTER TABLE water.charge_version_workflows ENABLE TRIGGER ALL;
  ALTER TABLE water.licences ENABLE TRIGGER ALL;
  ALTER TABLE water.licence_agreements ENABLE TRIGGER ALL;
  ALTER TABLE water.licence_versions ENABLE TRIGGER ALL;
  ALTER TABLE water.licence_version_purposes ENABLE TRIGGER ALL;
  ALTER TABLE water.return_requirement_purposes ENABLE TRIGGER ALL;
  ALTER TABLE water.return_requirements ENABLE TRIGGER ALL;
  ALTER TABLE water.return_versions ENABLE TRIGGER ALL;
  ALTER TABLE water.scheduled_notification ENABLE TRIGGER ALL;
  `)
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

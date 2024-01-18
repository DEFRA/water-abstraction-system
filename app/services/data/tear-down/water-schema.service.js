'use strict'

/**
 * Removes all data created for acceptance tests from the water schema
 * @module WaterSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
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

  return _regions()
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

module.exports = {
  go
}

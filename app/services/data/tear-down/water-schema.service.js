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
    _purposesPrimary,
    _purposesSecondary(),
    _purposesUses(),
    _scheduledNotification(),
    _events(),
    _sessions()
  ])

  // We have to do region and licence separate from the rest because they are the 'root' test records. The test data
  // setup endpoint in water-abstraction-service will create the test region and licence records (plus others). The
  // acceptance tests will then generate new data linked to these 'root' records, for example, new bill runs and licence
  // agreements.
  //
  // These do not get flagged as `is_test`. So, to find them for deletion we have to join to the 'root' test records. If
  // we included deleting these along with the other statements they could be deleted before statements like, delete
  // from bill runs where region is 'test'.
  return _regionsAndLicences()
}

async function _billingTransactions () {
  return db.raw(`
  ALTER TABLE water.billing_transactions DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."billing_transactions" AS "bt"
      USING "water"."billing_invoice_licences" AS "bil",
    "water"."billing_invoices" AS "bi",
    "water"."billing_batches" AS "bb",
    "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bt"."billing_invoice_licence_id" = "bil"."billing_invoice_licence_id"
    AND "bil"."billing_invoice_id" = "bi"."billing_invoice_id"
    AND "bi"."billing_batch_id" = "bb"."billing_batch_id"
    AND "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_transactions ENABLE TRIGGER ALL;
  `)
}

async function _billingInvoiceLicences () {
  return db.raw(`
  ALTER TABLE water.billing_invoice_licences DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."billing_invoice_licences" AS "bil"
      USING "water"."billing_invoices" AS "bi",
    "water"."billing_batches" AS "bb",
    "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bil"."billing_invoice_id" = "bi"."billing_invoice_id"
    AND "bi"."billing_batch_id" = "bb"."billing_batch_id"
    AND "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_invoice_licences ENABLE TRIGGER ALL;
  `)
}

async function _billingInvoices () {
  return db.raw(`
  ALTER TABLE water.billing_invoices DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."billing_invoices" AS "bi"
      USING "water"."billing_batches" AS "bb",
    "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bi"."billing_batch_id" = "bb"."billing_batch_id"
    AND "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_invoices ENABLE TRIGGER ALL;
  `)
}

async function _billingChargeVersionYears () {
  return db.raw(`
  ALTER TABLE water.billing_batch_charge_version_years DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."billing_batch_charge_version_years" AS "bbcvy"
      USING "water"."billing_batches" AS "bb",
    "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bbcvy"."billing_batch_id" = "bb"."billing_batch_id"
    AND "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_batch_charge_version_years ENABLE TRIGGER ALL;
  `)
}

async function _billingVolumes () {
  return db.raw(`
  ALTER TABLE water.billing_volumes DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."billing_volumes" AS "bv"
      USING "water"."billing_batches" AS "bb",
    "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bv"."billing_batch_id" = "bb"."billing_batch_id"
    AND "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_volumes ENABLE TRIGGER ALL;
  `)
}

async function _billingBatches () {
  return db.raw(`
  ALTER TABLE water.billing_batches DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."billing_batches" AS "bb"
      USING "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bb"."region_id" = "r"."region_id";

  ALTER TABLE water.billing_batches ENABLE TRIGGER ALL;
  `)
}

async function _gaugingStations () {
  return db.raw(`
  DELETE
  FROM
    "water"."licence_gauging_stations" AS "lgs"
      USING "water"."gauging_stations" AS "gs"
  WHERE
    "gs"."is_test" = TRUE
    AND "lgs"."gauging_station_id" = "gs"."gauging_station_id";

  DELETE
  FROM
    "water"."gauging_stations"
  WHERE
    "is_test" = TRUE;
  `)
}

async function _chargeElements () {
  return db.raw(`
  ALTER TABLE water.charge_elements DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."charge_elements"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."charge_elements" AS "ce"
      USING "water"."charge_versions" AS "cv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "ce"."charge_version_id" = "cv"."charge_version_id"
    AND "cv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.charge_elements ENABLE TRIGGER ALL;
  `)
}

async function _chargeVersionWorkflows () {
  return db.raw(`
  ALTER TABLE water.charge_version_workflows DISABLE TRIGGER ALL;

  TRUNCATE
    "water"."charge_version_workflows";

  ALTER TABLE water.charge_version_workflows ENABLE TRIGGER ALL;
  `)
}

async function _chargeVersions () {
  return db.raw(`
  ALTER TABLE water.charge_versions DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."charge_versions" AS "cv"
      USING "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "cv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.charge_versions ENABLE TRIGGER ALL;
  `)
}

async function _licenceAgreements () {
  return db.raw(`
  ALTER TABLE water.licence_agreements DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."licence_agreements"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."licence_agreements" AS "la"
      USING "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "la"."licence_ref" = "l"."licence_ref";

  ALTER TABLE water.licence_agreements ENABLE TRIGGER ALL;
  `)
}

async function _returnRequirementPurposes () {
  return db.raw(`
  ALTER TABLE water.return_requirement_purposes DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."return_requirement_purposes" AS "rrp"
      USING "water"."return_requirements" AS "rr",
    "water"."return_versions" AS "rv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "rrp"."return_requirement_id" = "rr"."return_requirement_id"
    AND "rr"."return_version_id" = "rv"."return_version_id"
    AND "rv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.return_requirement_purposes ENABLE TRIGGER ALL;
  `)
}

async function _returnRequirements () {
  return db.raw(`
  ALTER TABLE water.return_requirements DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."return_requirements" AS "rr"
      USING "water"."return_versions" AS "rv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "rr"."return_version_id" = "rv"."return_version_id"
    AND "rv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.return_requirements ENABLE TRIGGER ALL;
  `)
}

async function _returnVersions () {
  return db.raw(`
  ALTER TABLE water.return_versions DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."return_versions" AS "rv"
      USING "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "rv"."licence_id" = "l"."licence_id";

  ALTER TABLE water.return_versions ENABLE TRIGGER ALL;
  `)
}

async function _financialAgreementTypes () {
  return db.raw(`
  DELETE
  FROM
    "water"."financial_agreement_types"
  WHERE
    "is_test" = TRUE;
  `)
}

async function _licenceVersionPurposes () {
  return db.raw(`
  ALTER TABLE water.licence_version_purposes DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."licence_version_purposes"
  WHERE
    "is_test" = TRUE;

  ALTER TABLE water.licence_version_purposes ENABLE TRIGGER ALL;
  `)
}

async function _licenceVersions () {
  return db.raw(`
  ALTER TABLE water.licence_versions DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."licence_versions"
  WHERE
    "is_test" = TRUE;

  ALTER TABLE water.licence_versions ENABLE TRIGGER ALL;
  `)
}

async function _purposesPrimary () {
  return db.raw(`
  DELETE
  FROM
    "water"."purposes_primary"
  WHERE
    "is_test" = TRUE;
  `)
}

async function _purposesSecondary () {
  return db.raw(`
  DELETE
  FROM
    "water"."purposes_secondary"
  WHERE
    "is_test" = TRUE;
  `)
}

async function _purposesUses () {
  return db.raw(`
  DELETE
  FROM
    "water"."purposes_uses"
  WHERE
    "is_test" = TRUE;
  `)
}

async function _scheduledNotification () {
  return db.raw(`
  ALTER TABLE water.scheduled_notification DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."scheduled_notification"
  WHERE
    "message_ref" = 'test-ref';

  DELETE
  FROM
    "water"."scheduled_notification" AS "sn"
      USING "water"."events" AS "e"
  WHERE
    "e"."issuer" LIKE 'acceptance-test%'
    AND "sn"."event_id" = "e"."event_id";

  ALTER TABLE water.scheduled_notification ENABLE TRIGGER ALL;
  `)
}

async function _events () {
  return db.raw(`
  DELETE
  FROM
    "water"."events"
  WHERE
    "issuer" LIKE 'acceptance-test%';
  `)
}

async function _sessions () {
  return db.raw(`
  DELETE
  FROM
    "water"."sessions"
  WHERE
    session_data::jsonb->>'companyName' = 'acceptance-test-company';
  `)
}

async function _regionsAndLicences () {
  return db.raw(`
  ALTER TABLE water.licences DISABLE TRIGGER ALL;

  DELETE
  FROM
    "water"."licences"
  WHERE
    "is_test" = TRUE;

  DELETE
    FROM
      "water"."regions"
    WHERE
      "is_test" = TRUE;

  ALTER TABLE water.licences ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}

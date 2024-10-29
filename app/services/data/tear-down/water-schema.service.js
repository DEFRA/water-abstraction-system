'use strict'

/**
 * Removes all data created for acceptance tests from the water schema
 * @module WaterSchemaService
 */

const { db } = require('../../../../db/db.js')

/**
 * Removes all data created for acceptance tests from the water schema
 *
 * @returns {Promise<object>}
 */
async function go () {
  return _deleteAllTestData()
}

async function _deleteAllTestData () {
  return db.raw(`
  ALTER TABLE water.billing_batch_charge_version_years DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_batches DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoices DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoice_licences DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_transactions DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_volumes DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_elements DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_purposes DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_versions DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_version_workflows DISABLE TRIGGER ALL;
  ALTER TABLE water.licence_agreements DISABLE TRIGGER ALL;
  ALTER TABLE water.licences DISABLE TRIGGER ALL;
  ALTER TABLE water.licence_versions DISABLE TRIGGER ALL;
  ALTER TABLE water.licence_version_purposes DISABLE TRIGGER ALL;
  ALTER TABLE water.licence_version_purpose_conditions DISABLE TRIGGER ALL;
  ALTER TABLE water.return_requirement_purposes DISABLE TRIGGER ALL;
  ALTER TABLE water.return_requirement_points DISABLE TRIGGER ALL;
  ALTER TABLE water.return_requirements DISABLE TRIGGER ALL;
  ALTER TABLE water.return_versions DISABLE TRIGGER ALL;
  ALTER TABLE water.scheduled_notification DISABLE TRIGGER ALL;

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

  DELETE
  FROM
    "water"."billing_invoices" AS "bi"
      USING "water"."billing_batches" AS "bb",
    "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bi"."billing_batch_id" = "bb"."billing_batch_id"
    AND "bb"."region_id" = "r"."region_id";

  DELETE
  FROM
    "water"."billing_batch_charge_version_years" AS "bbcvy"
      USING "water"."billing_batches" AS "bb",
    "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bbcvy"."billing_batch_id" = "bb"."billing_batch_id"
    AND "bb"."region_id" = "r"."region_id";

  DELETE
  FROM
    "water"."billing_volumes" AS "bv"
      USING "water"."billing_batches" AS "bb",
    "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bv"."billing_batch_id" = "bb"."billing_batch_id"
    AND "bb"."region_id" = "r"."region_id";

  DELETE
  FROM
    "water"."billing_batches" AS "bb"
      USING "water"."regions" AS "r"
  WHERE
    "r"."is_test" = TRUE
    AND "bb"."region_id" = "r"."region_id";

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

  DELETE
  FROM
    "water"."charge_elements"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."charge_version_workflows";

  DELETE
  FROM
      "water"."charge_purposes" AS "cp"
      USING "water"."charge_elements" AS "ce",
      "water"."charge_versions" AS "cv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "cp"."charge_element_id" = "ce"."charge_element_id"
    AND "ce"."charge_version_id" = "cv"."charge_version_id"
    AND "cv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."charge_elements" AS "ce"
      USING "water"."charge_versions" AS "cv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "ce"."charge_version_id" = "cv"."charge_version_id"
    AND "cv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."charge_versions" AS "cv"
      USING "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "cv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."charge_purposes"
  WHERE
    "is_test" = TRUE;
  DELETE
  FROM
    "water"."charge_elements"
  WHERE
    "is_test" = TRUE;
  DELETE
  FROM
    "water"."charge_versions"
  WHERE
    "is_test" = TRUE;

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

  DELETE
  FROM
    "water"."points" AS p
      USING "water"."return_requirement_points" AS "rrpt",
    "water"."return_requirements" AS "rr",
    "water"."return_versions" AS "rv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "p"."id" = "rrpt"."point_id"
    AND "rrpt"."return_requirement_id" = "rr"."return_requirement_id"
    AND "rr"."return_version_id" = "rv"."return_version_id"
    AND "rv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."return_requirement_points" AS "rrpt"
      USING "water"."return_requirements" AS "rr",
    "water"."return_versions" AS "rv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "rrpt"."return_requirement_id" = "rr"."return_requirement_id"
    AND "rr"."return_version_id" = "rv"."return_version_id"
    AND "rv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."return_requirements" AS "rr"
      USING "water"."return_versions" AS "rv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "rr"."return_version_id" = "rv"."return_version_id"
    AND "rv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."mod_logs" AS "ml"
      USING "water"."return_versions" AS "rv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "ml"."return_version_id" = "rv"."return_version_id"
    AND "rv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."return_versions" AS "rv"
      USING "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "rv"."licence_id" = "l"."licence_id";

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

  DELETE
  FROM
    "water"."financial_agreement_types"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."points" AS "p"
      USING"water"."licence_version_purpose_points" AS "lvpp",
    "water"."licence_version_purposes" AS "lvp",
    "water"."licence_versions" AS "lv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "p"."id" = "lvpp"."point_id"
    AND "lvpp"."licence_version_purpose_id" = "lvp"."licence_version_purpose_id"
    AND "lvp"."licence_version_id" = "lv"."licence_version_id"
    AND "lv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."licence_version_purpose_points" AS "lvpp"
      USING "water"."licence_version_purposes" AS "lvp",
    "water"."licence_versions" AS "lv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "lvpp"."licence_version_purpose_id" = "lvp"."licence_version_purpose_id"
    AND "lvp"."licence_version_id" = "lv"."licence_version_id"
    AND "lv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."licence_version_purposes"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."mod_logs" AS "ml"
      USING "water"."licence_versions" AS "lv",
    "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "ml"."licence_version_id" = "lv"."licence_version_id"
    AND "lv"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."mod_logs" AS "ml"
    USING "water"."licences" AS "l"
  WHERE
    "l"."is_test" = TRUE
    AND "ml"."licence_id" = "l"."licence_id";

  DELETE
  FROM
    "water"."licence_versions"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."licences"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."purposes_primary"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."purposes_secondary"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "water"."purposes_uses"
  WHERE
    "is_test" = TRUE;

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

  DELETE
  FROM
    "water"."events"
  WHERE
    "issuer" LIKE 'acceptance-test%';

  DELETE
  FROM
    "water"."sessions"
  WHERE
    session_data::jsonb->>'companyName' = 'acceptance-test-company';

  ALTER TABLE water.billing_batch_charge_version_years ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_batches ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoices ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoice_licences ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_transactions ENABLE TRIGGER ALL;
  ALTER TABLE water.billing_volumes ENABLE TRIGGER ALL;
  ALTER TABLE water.charge_elements ENABLE TRIGGER ALL;
  ALTER TABLE water.charge_purposes ENABLE TRIGGER ALL;
  ALTER TABLE water.charge_versions ENABLE TRIGGER ALL;
  ALTER TABLE water.charge_version_workflows ENABLE TRIGGER ALL;
  ALTER TABLE water.licence_agreements ENABLE TRIGGER ALL;
  ALTER TABLE water.licences ENABLE TRIGGER ALL;
  ALTER TABLE water.licence_versions ENABLE TRIGGER ALL;
  ALTER TABLE water.licence_version_purposes ENABLE TRIGGER ALL;
  ALTER TABLE water.licence_version_purpose_conditions ENABLE TRIGGER ALL;
  ALTER TABLE water.return_requirement_purposes ENABLE TRIGGER ALL;
  ALTER TABLE water.return_requirement_points ENABLE TRIGGER ALL;
  ALTER TABLE water.return_requirements ENABLE TRIGGER ALL;
  ALTER TABLE water.return_versions ENABLE TRIGGER ALL;
  ALTER TABLE water.scheduled_notification ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}

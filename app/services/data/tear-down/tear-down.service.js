'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const { db } = require('../../../../db/db.js')

const WaterSchemaService = require('./water-schema.service.js')
const CrmSchemaService = require('./crm-schema.service.js')
const ReturnsSchemaService = require('./returns-schema.service.js')
const PermitSchemaService = require('./permit-schema.service.js')
const IdmSchemaService = require('./idm-schema.service.js')

async function go () {
  const startTime = process.hrtime.bigint()

  // await Promise.all([
  //   WaterSchemaService.go(),
  //   CrmSchemaService.go(),
  //   ReturnsSchemaService.go(),
  //   PermitSchemaService.go(),
  //   IdmSchemaService.go()
  // ])

  await _delete()

  _calculateAndLogTime(startTime)
}

async function _delete () {
  return db.raw(`
  -- CRM
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

  -- IDM

  delete from "idm"."users" where jsonb_path_query_first("user_data", '$.source') #>> '{}' = 'acceptance-test-setup' or "user_name" like '%@example.com';

  -- PERMIT

  ALTER TABLE permit.licence DISABLE TRIGGER ALL;

  delete from "permit"."licence" where jsonb_path_query_first("metadata", '$.source') #>> '{}' = 'acceptance-test-setup';

  ALTER TABLE permit.licence ENABLE TRIGGER ALL;

  -- RETURNS

  ALTER TABLE returns.lines DISABLE TRIGGER ALL;
  ALTER TABLE returns.versions DISABLE TRIGGER ALL;
  ALTER TABLE returns.returns DISABLE TRIGGER ALL;

  delete from "returns"."lines" as "l" using "returns"."versions" as "v","returns"."returns" as "r" where "r"."is_test" = true and "l"."version_id" = "v"."version_id" and "v"."return_id" = "r"."return_id";
  delete from "returns"."versions" as "v" using "returns"."returns" as "r" where "r"."is_test" = true and "v"."return_id" = "r"."return_id";
  delete from "returns"."returns" where "is_test" = TRUE;

  ALTER TABLE returns.lines ENABLE TRIGGER ALL;
  ALTER TABLE returns.versions ENABLE TRIGGER ALL;
  ALTER TABLE returns.returns ENABLE TRIGGER ALL;

  -- WATER

  ALTER TABLE water.billing_batch_charge_version_years DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_batches DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoices DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_invoice_licences DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_transactions DISABLE TRIGGER ALL;
  ALTER TABLE water.billing_volumes DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_elements DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_versions DISABLE TRIGGER ALL;
  ALTER TABLE water.charge_version_workflows DISABLE TRIGGER ALL;
  ALTER TABLE water.licence_agreements DISABLE TRIGGER ALL;
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
  delete from "water"."licence_agreements" where "is_test" = TRUE;
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
  ALTER TABLE water.licence_agreements ENABLE TRIGGER ALL;
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

  global.GlobalNotifier.omg('Tear down complete', { timeTakenMs })
}

module.exports = {
  go
}

'use strict'

/**
 * Removes all data created for acceptance tests from the public schema
 * @module PublicSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  return _deleteAllTestData()
}

async function _deleteAllTestData () {
  return db.raw(`
  DELETE
  FROM
    "public"."licence_supplementary_years" AS "lsy"
      USING "public"."licences" AS "l",
    "public"."regions" AS "r"
  WHERE
    "r"."nald_region_id" = 9
    AND "lsy"."licence_id" = "l"."id"
    AND "l"."region_id" = "r"."id";

  DELETE
  FROM
    "public"."review_returns" AS "rr"
      USING "public"."review_licences" AS "rl",
    "public"."bill_runs" AS "br",
    "public"."regions" AS "r"
  WHERE
    "r"."nald_region_id" = 9
    AND "rr"."review_licence_id" = "rl"."id"
    AND "rl"."bill_run_id" = "br"."id"
    AND "br"."region_id" = "r"."id";

  DELETE
  FROM
    "public"."review_charge_elements_returns" AS "rcer"
      USING "public"."review_charge_elements" AS "rce",
    "public"."review_charge_references" AS "rcr",
    "public"."review_charge_versions" AS "rcv",
    "public"."review_licences" AS "rl",
    "public"."bill_runs" AS "br",
    "public"."regions" AS "r"
  WHERE
    "r"."nald_region_id" = 9
    AND "rcer"."review_charge_element_id" = "rce"."id"
    AND "rce"."review_charge_reference_id" = "rcr"."id"
    AND "rcr"."review_charge_version_id" = "rcv"."id"
    AND "rcv"."review_licence_id" = "rl"."id"
    AND "rl"."bill_run_id" = "br"."id"
    AND "br"."region_id" = "r"."id";

  DELETE
  FROM
    "public"."review_charge_elements" AS "rce"
      USING "public"."review_charge_references" AS "rcr",
    "public"."review_charge_versions" AS "rcv",
    "public"."review_licences" AS "rl",
    "public"."bill_runs" AS "br",
    "public"."regions" AS "r"
  WHERE
  "r"."nald_region_id" = 9
    AND "rce"."review_charge_reference_id" = "rcr"."id"
    AND "rcr"."review_charge_version_id" = "rcv"."id"
    AND "rcv"."review_licence_id" = "rl"."id"
    AND "rl"."bill_run_id" = "br"."id"
    AND "br"."region_id" = "r"."id";

  DELETE
  FROM
    "public"."review_charge_references" AS "rcr"
      USING "public"."review_charge_versions" AS "rcv",
    "public"."review_licences" AS "rl",
    "public"."bill_runs" AS "br",
    "public"."regions" AS "r"
  WHERE
    "r"."nald_region_id" = 9
    AND "rcr"."review_charge_version_id" = "rcv"."id"
    AND "rcv"."review_licence_id" = "rl"."id"
    AND "rl"."bill_run_id" = "br"."id"
    AND "br"."region_id" = "r"."id";

  DELETE
  FROM
    "public"."review_charge_versions" AS "rcv"
      USING "public"."review_licences" AS "rl",
    "public"."bill_runs" AS "br",
    "public"."regions" AS "r"
  WHERE
    "r"."nald_region_id" = 9
    AND "rcv"."review_licence_id" = "rl"."id"
    AND "rl"."bill_run_id" = "br"."id"
    AND "br"."region_id" = "r"."id";

  DELETE
  FROM
    "public"."review_licences" AS "rl"
      USING "public"."bill_runs" AS "br",
    "public"."regions" AS "r"
  WHERE
    "r"."nald_region_id" = 9
    AND "rl"."bill_run_id" = "br"."id"
    AND "br"."region_id" = "r"."id";
  `)
}

module.exports = {
  go
}

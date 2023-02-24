'use strict'

exports.up = function (knex) {
  return knex.raw(`
    CREATE SCHEMA IF NOT EXISTS "crm_v2";
  `)
}

exports.down = function (knex) {
  return knex.raw(`
    DROP SCHEMA IF EXISTS "crm_v2";
  `)
}

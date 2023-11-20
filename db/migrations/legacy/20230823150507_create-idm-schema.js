'use strict'

exports.up = function (knex) {
  return knex.raw(`
    CREATE SCHEMA IF NOT EXISTS "idm";
  `)
}

exports.down = function (knex) {
  return knex.raw(`
    DROP SCHEMA IF EXISTS "idm";
  `)
}

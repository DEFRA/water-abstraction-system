'use strict'

exports.up = function (knex) {
  return knex.raw(`
    CREATE SCHEMA IF NOT EXISTS "permit";
  `)
}

exports.down = function (knex) {
  return knex.raw(`
    DROP SCHEMA IF EXISTS "permit";
  `)
}

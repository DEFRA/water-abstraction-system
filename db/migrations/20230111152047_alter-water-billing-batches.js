'use strict'

const tableName = 'billing_batches'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.string('external_id')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.dropColumn('external_id')
    })
}

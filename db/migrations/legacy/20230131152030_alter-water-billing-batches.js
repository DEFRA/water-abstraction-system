'use strict'

const tableName = 'billing_batches'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.integer('error_code')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.dropColumn('error_code')
    })
}

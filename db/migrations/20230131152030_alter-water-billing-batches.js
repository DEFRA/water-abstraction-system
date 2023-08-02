'use strict'

const tableName = 'billing_batches'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.integer('error_code')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.dropColumn('error_code')
    })
}

'use strict'

const tableName = 'billing_batches'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.string('external_id')
    })
}

exports.down = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.dropColumn('external_id')
    })
}

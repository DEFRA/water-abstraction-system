'use strict'

const tableName = 'charge_versions'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.uuid('change_reason_id')
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.dropColumns(
        'change_reason_id'
      )
    })
}

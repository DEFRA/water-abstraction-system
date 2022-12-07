'use strict'

const tableName = 'charge_versions'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.date('start_date')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.dropColumns('start_date')
    })
}

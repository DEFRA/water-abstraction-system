'use strict'

const tableName = 'charge_versions'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.integer('region_code')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.dropColumns(
        'region_code'
      )
    })
}

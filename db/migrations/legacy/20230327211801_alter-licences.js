'use strict'

const tableName = 'licences'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.boolean('include_in_sroc_supplementary_billing').notNullable().defaultTo(false)
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.dropColumns(
        'include_in_sroc_supplementary_billing'
      )
    })
}

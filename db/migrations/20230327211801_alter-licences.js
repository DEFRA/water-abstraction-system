'use strict'

const tableName = 'licences'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.boolean('include_in_sroc_supplementary_billing').notNullable().defaultTo(false)
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.dropColumns(
        'include_in_sroc_supplementary_billing'
      )
    })
}

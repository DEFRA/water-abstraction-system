'use strict'

const tableName = 'review_charge_elements'

exports.up = async function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.decimal('calculated', null, null).defaultTo(0)
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.dropColumn('calculated')
    })
}

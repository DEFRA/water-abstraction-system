'use strict'

const tableName = 'review_charge_elements'

exports.up = async function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.decimal('amended_allocated', null, null).defaultTo(0)
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.decimal('amended_allocated')
    })
}

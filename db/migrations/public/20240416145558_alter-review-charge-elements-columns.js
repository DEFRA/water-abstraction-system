'use strict'

exports.up = async function (knex) {
  return knex
    .schema
    .table('review_charge_elements', (table) => {
      table.decimal('calculated')
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .table('review_charge_elements', (table) => {
      table.dropColumn('calculated')
    })
}

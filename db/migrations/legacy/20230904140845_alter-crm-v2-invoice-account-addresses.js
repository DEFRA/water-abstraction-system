'use strict'

const tableName = 'invoice_account_addresses'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .alterTable(tableName, (table) => {
      table.unique(['invoice_account_id', 'start_date'], { useConstraint: true })
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .alterTable(tableName, (table) => {
      table.dropUnique(['invoice_account_id', 'start_date'])
    })
}

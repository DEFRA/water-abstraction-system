'use strict'

const tableName = 'review_results'

exports.up = function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.dropColumns('bill_run_id', 'licence_id', 'review_charge_element_result_id', 'review_return_result_id')

      table.uuid('review_licence_result_id')
      table.uuid('review_charge_element_id')
      table.uuid('review_return_id')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.dropColumns('review_licence_result_id', 'review_charge_element_id', 'review_return_id')

      table.uuid('bill_run_id')
      table.uuid('licence_id')
      table.uuid('review_charge_element_result_id')
      table.uuid('review_return_result_id')
    })
}

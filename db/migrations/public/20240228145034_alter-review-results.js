'use strict'

const tableName = 'review_results'

exports.up = function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.dropColumns('bill_run_id', 'licence_id')

      table.uuid('review_licence_result_id').after('id')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.dropColumn('review_licence_result_id')

      table.uuid('bill_run_id').after('id')
      table.uuid('licence_id').after('bill_run_id')
    })
}

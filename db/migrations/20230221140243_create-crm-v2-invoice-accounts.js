'use strict'

const tableName = 'invoice_accounts'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('crm_v2')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('invoice_account_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('company_id')
      table.string('invoice_account_number')
      table.date('start_date')
      table.date('end_date')
      table.string('last_transaction_file_reference')
      table.timestamp('date_last_transaction_file_reference_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .dropTableIfExists(tableName)
}

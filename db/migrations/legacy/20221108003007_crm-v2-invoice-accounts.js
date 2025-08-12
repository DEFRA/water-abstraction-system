'use strict'

const tableName = 'invoice_accounts'

exports.up = function (knex) {
  return knex.schema.withSchema('crm_v2').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('invoice_account_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('company_id').notNullable()
    table.string('invoice_account_number').notNullable().unique()
    table.date('start_date')
    table.date('end_date')
    table.boolean('is_test').notNullable().defaultTo(false)
    table.string('last_transaction_file_reference')
    table.timestamp('date_last_transaction_file_reference_updated', { useTz: false })

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['company_id', 'invoice_account_number'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm_v2').dropTableIfExists(tableName)
}

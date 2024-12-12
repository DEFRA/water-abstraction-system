'use strict'

const tableName = 'billing_batches'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('billing_batch_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('region_id').notNullable()
    table.string('batch_type').notNullable()
    table.integer('from_financial_year_ending').notNullable()
    table.integer('to_financial_year_ending').notNullable()
    table.string('status').notNullable()
    table.integer('invoice_count')
    table.integer('credit_note_count')
    table.integer('net_total')
    table.integer('bill_run_number')
    table.integer('error_code')
    table.uuid('external_id')
    table.boolean('is_summer').notNullable().defaultTo(false)
    table.string('source').notNullable().defaultTo('wrls')
    table.string('legacy_id').unique()
    table.jsonb('metadata')
    table.decimal('invoice_value')
    table.decimal('credit_note_value')
    table.string('transaction_file_reference')
    table.string('scheme')

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.check('?? >= 0', ['invoice_count'])
    table.check('?? >= 0', ['invoice_value'])
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}

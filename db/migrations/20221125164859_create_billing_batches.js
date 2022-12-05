'use strict'

const tableName = 'billing_batches'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('billing_batch_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('region_id')
      table.string('batch_type')
      table.integer('from_financial_year_ending')
      table.integer('to_financial_year_ending')
      table.string('status')
      table.integer('invoice_count')
      table.integer('credit_note_count')
      table.integer('net_total')
      table.integer('bill_run_number')
      table.string('source')
      table.decimal('invoice_value')
      table.decimal('credit_note_value')
      table.string('transaction_file_reference')
      table.string('scheme')

      // Automatic timestamps
      table.timestamps(false, true)
    })

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON water.${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `)
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}

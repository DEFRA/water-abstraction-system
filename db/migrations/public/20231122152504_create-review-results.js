'use strict'

const tableName = 'review_results'

exports.up = function (knex) {
  return knex.schema
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('bill_run_id').notNullable()
      table.uuid('licence_id').notNullable()
      table.uuid('charge_version_id')
      table.uuid('charge_reference_id')
      table.date('charge_period_start_date')
      table.date('charge_period_end_date')
      table.string('charge_version_change_reason')
      table.uuid('review_charge_element_result_id')
      table.uuid('review_return_result_id')

      // Automatic timestamps
      table.timestamps(false, true)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${tableName}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(tableName)
}

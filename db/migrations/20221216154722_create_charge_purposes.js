'use strict'

const tableName = 'charge_purposes'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('charge_purpose_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('charge_element_id')
      table.integer('abstraction_period_start_day')
      table.integer('abstraction_period_start_month')
      table.integer('abstraction_period_end_day')
      table.integer('abstraction_period_end_month')
      table.decimal('authorised_annual_quantity')
      table.string('loss')
      table.boolean('factors_overridden')
      table.decimal('billable_annual_quantity')
      table.date('time_limited_start_date')
      table.date('time_limited_end_date')
      table.string('description')
      table.uuid('purpose_primary_id')
      table.uuid('purpose_secondary_id')
      table.uuid('purpose_use_id')
      table.boolean('is_section_127_agreement_enabled')

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

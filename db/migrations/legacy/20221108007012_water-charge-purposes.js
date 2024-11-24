'use strict'

const tableName = 'charge_purposes'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('charge_purpose_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('charge_element_id').notNullable()
    table.smallint('abstraction_period_start_day').notNullable()
    table.smallint('abstraction_period_start_month').notNullable()
    table.smallint('abstraction_period_end_day').notNullable()
    table.smallint('abstraction_period_end_month').notNullable()
    table.decimal('authorised_annual_quantity').notNullable()
    table.string('loss').notNullable()
    table.boolean('factors_overridden').notNullable()
    table.decimal('billable_annual_quantity')
    table.date('time_limited_start_date')
    table.date('time_limited_end_date')
    table.string('description')
    table.boolean('is_test').notNullable().defaultTo(false)
    table.uuid('purpose_primary_id')
    table.uuid('purpose_secondary_id')
    table.uuid('purpose_use_id').notNullable()
    table.boolean('is_section_127_agreement_enabled').notNullable().defaultTo(true)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}

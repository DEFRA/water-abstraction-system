'use strict'

const tableName = 'licence_version_purposes'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('licence_version_purpose_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('licence_version_id').notNullable()
      table.uuid('purpose_primary_id').notNullable()
      table.uuid('purpose_secondary_id').notNullable()
      table.uuid('purpose_use_id').notNullable()
      table.smallint('abstraction_period_start_day').notNullable()
      table.smallint('abstraction_period_start_month').notNullable()
      table.smallint('abstraction_period_end_day').notNullable()
      table.smallint('abstraction_period_end_month').notNullable()
      table.date('time_limited_start_date')
      table.date('time_limited_end_date')
      table.text('notes')
      table.decimal('instant_quantity')
      table.decimal('daily_quantity')
      table.decimal('hourly_quantity')
      table.decimal('annual_quantity')
      table.string('external_id').unique()
      table.boolean('is_test')

      // Legacy timestamps
      // NOTE: They are not automatically set
      table.dateTime('date_created').notNullable()
      table.dateTime('date_updated').notNullable()
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}

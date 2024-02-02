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
      table.integer('abstraction_period_start_day').notNullable()
      table.integer('abstraction_period_start_month').notNullable()
      table.integer('abstraction_period_end_day').notNullable()
      table.integer('abstraction_period_end_month').notNullable()
      table.date('time_limited_start_date')
      table.date('time_limited_end_date')
      table.text('notes')
      table.decimal('annual_quantity')
      table.dateTime('date_created').notNullable()
      table.dateTime('date_updated').notNullable()
      table.string('external_id')
      table.boolean('is_test')

      // Legacy timestamps
      // NOTE: They are not automatically set and there are large numbers of records where these fields are null!
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Constraints
      table.unique(['external_id'], { useConstraint: true })
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}

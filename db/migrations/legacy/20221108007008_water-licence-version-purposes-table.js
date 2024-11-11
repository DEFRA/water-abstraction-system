'use strict'

const tableName = 'licence_version_purposes'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
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
    table.decimal('instant_quantity', null, null)
    table.decimal('daily_quantity', null, null)
    table.decimal('hourly_quantity', null, null)
    table.decimal('annual_quantity', null, null)
    table.string('external_id').notNullable()
    table.boolean('is_test').notNullable().default(false)

    // Legacy timestamps
    // NOTE: They are not automatically set
    table.dateTime('date_created').notNullable().defaultTo(knex.fn.now())
    table.dateTime('date_updated').notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['external_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}

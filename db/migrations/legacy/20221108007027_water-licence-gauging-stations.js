'use strict'

const tableName = 'licence_gauging_stations'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('licence_gauging_station_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('licence_id').notNullable()
    table.uuid('gauging_station_id').notNullable()
    table.string('source').notNullable()
    table.uuid('licence_version_purpose_condition_id')
    table.smallint('abstraction_period_start_day')
    table.smallint('abstraction_period_start_month')
    table.smallint('abstraction_period_end_day')
    table.smallint('abstraction_period_end_month')
    table.string('restriction_type').notNullable()
    table.string('threshold_unit').notNullable()
    table.decimal('threshold_value').notNullable()
    table.string('status').notNullable().defaultTo('resume')
    table.timestamp('date_status_updated', { useTz: false })
    table.timestamp('date_deleted', { useTz: false })
    table.string('alert_type').notNullable().default('reduce')
    table.integer('created_by')
    table.boolean('is_test').defaultTo(false)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable()
    table.timestamp('date_updated', { useTz: false }).notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}

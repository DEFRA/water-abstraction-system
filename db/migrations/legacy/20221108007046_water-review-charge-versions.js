'use strict'

const tableName = 'review_charge_versions'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('review_licence_id').notNullable()
    table.uuid('charge_version_id').notNullable()
    table.string('change_reason').notNullable()
    table.date('charge_period_start_date').notNullable()
    table.date('charge_period_end_date').notNullable()

    // Timestamps
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}

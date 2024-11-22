'use strict'

const tableName = 'regions'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('region_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('charge_region_id').notNullable()
    table.integer('nald_region_id').notNullable()
    table.string('name').notNullable()
    table.text('display_name').notNullable()
    table.boolean('is_test').notNullable().defaultTo(false)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}

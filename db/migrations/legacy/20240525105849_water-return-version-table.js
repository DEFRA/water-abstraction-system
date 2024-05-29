'use strict'

const tableName = 'return_version'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('return_version_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('licence_id')
      table.integer('version_number')
      table.timestamp('start_date')
      table.timestamp('end_date')
      table.text('status')
      table.text('external_id')
      table.text('reason')
      table.boolean('multiple_upload')
      table.text('notes')

      // Legacy timestamps
      table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}

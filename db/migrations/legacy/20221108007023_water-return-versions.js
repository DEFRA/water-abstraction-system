'use strict'

const tableName = 'return_versions'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('return_version_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('licence_id').notNullable()
      table.integer('version_number').notNullable()
      table.date('start_date').notNullable()
      table.date('end_date')
      table.string('status').notNullable()
      table.string('external_id')
      table.text('reason')
      table.boolean('multiple_upload').notNullable().defaultTo(false)
      table.boolean('quarterly_returns').notNullable().defaultTo(false)
      table.text('notes')
      table.integer('created_by')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

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

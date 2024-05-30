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
      table.string('reason')
      table.boolean('multiple_upload')
      table.text('notes')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable()
      table.timestamp('date_updated', { useTz: false })

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

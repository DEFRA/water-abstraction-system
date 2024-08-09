'use strict'

const tableName = 'licence_versions'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('licence_version_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('licence_id').notNullable()
      table.integer('issue').notNullable()
      table.integer('increment').notNullable()
      table.string('status').notNullable()
      table.date('start_date').notNullable()
      table.date('end_date')
      table.string('external_id').notNullable().unique()
      table.boolean('is_test').notNullable().defaultTo(false)
      table.jsonb('mod_log').notNullable().defaultTo({})

      // Legacy timestamps
      // NOTE: They are not automatically set
      table.timestamp('date_created', { useTz: false }).notNullable()
      table.timestamp('date_updated', { useTz: false }).notNullable()
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}

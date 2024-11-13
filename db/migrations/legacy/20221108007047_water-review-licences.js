'use strict'

const tableName = 'review_licences'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('bill_run_id').notNullable()
      table.uuid('licence_id').notNullable()
      table.string('licence_ref').notNullable()
      table.string('licence_holder').notNullable()
      table.text('issues')
      table.string('status').notNullable().defaultTo('ready')
      table.boolean('progress').notNullable().defaultTo(false)

      // Timestamps
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}

'use strict'

const tableName = 'notes'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('note_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('text').notNullable()

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

      // Data
      table.integer('user_id').notNullable()
      table.string('type').notNullable()
      table.uuid('type_id').notNullable()
      table.uuid('licence_id')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}

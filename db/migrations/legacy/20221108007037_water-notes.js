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
      table.integer('user_id').notNullable()
      table.string('type').notNullable().defaultTo('charge_version')
      table.uuid('type_id')
      table.uuid('licence_id')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}

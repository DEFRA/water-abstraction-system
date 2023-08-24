'use strict'

const tableName = 'groups'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('idm')
    .createTable(tableName, (table) => {
      // Primary Key
      table.string('group_id').primary().notNullable()

      // Data
      table.string('application') // TODO: confirm what application_name datatype is
      table.string('group').notNullable()
      table.string('description').notNullable()

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('idm')
    .dropTableIfExists(tableName)
}
